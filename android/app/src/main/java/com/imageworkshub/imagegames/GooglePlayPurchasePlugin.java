package com.imageworkshub.imagegames;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ConsumeResponseListener;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "GooglePlayPurchase")
public class GooglePlayPurchasePlugin extends Plugin implements PurchasesUpdatedListener {
    private static final String BARRIER_PRODUCT_ID = "com.imageworkshub.imagegames.barrier3";
    private static final int BARRIER_QUANTITY = 3;

    private BillingClient billingClient;
    private ProductDetails barrierProduct;
    private PluginCall pendingPurchaseCall;

    @Override
    public void load() {
        PendingPurchasesParams pendingPurchasesParams = PendingPurchasesParams.newBuilder()
            .enableOneTimeProducts()
            .build();

        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(pendingPurchasesParams)
            .build();
    }

    @PluginMethod
    public void getBarrierProduct(PluginCall call) {
        loadBarrierProduct(new ProductCallback() {
            @Override
            public void onProduct(ProductDetails productDetails) {
                call.resolve(productPayload(productDetails));
            }

            @Override
            public void onError(String code, String message) {
                call.reject(message, code);
            }
        });
    }

    @PluginMethod
    public void purchaseBarrier(PluginCall call) {
        if (pendingPurchaseCall != null) {
            call.reject("Another purchase is already in progress.", "PURCHASE_IN_PROGRESS");
            return;
        }

        loadBarrierProduct(new ProductCallback() {
            @Override
            public void onProduct(ProductDetails productDetails) {
                ProductDetails.OneTimePurchaseOfferDetails offer = selectOneTimeOffer(productDetails);

                if (offer == null || offer.getOfferToken() == null) {
                    call.reject("The barrier product has no available offer.", "OFFER_NOT_FOUND");
                    return;
                }

                pendingPurchaseCall = call;

                BillingFlowParams.ProductDetailsParams productDetailsParams =
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(productDetails)
                        .setOfferToken(offer.getOfferToken())
                        .build();

                BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Collections.singletonList(productDetailsParams))
                    .build();

                BillingResult billingResult = billingClient.launchBillingFlow(getActivity(), billingFlowParams);

                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    pendingPurchaseCall = null;
                    call.reject(
                        billingResult.getDebugMessage(),
                        responseCodeToErrorCode(billingResult.getResponseCode())
                    );
                }
            }

            @Override
            public void onError(String code, String message) {
                call.reject(message, code);
            }
        });
    }

    @PluginMethod
    public void unfinishedPurchases(PluginCall call) {
        connectBillingClient(new ReadyCallback() {
            @Override
            public void onReady() {
                QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build();

                billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
                    if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        call.reject(
                            billingResult.getDebugMessage(),
                            responseCodeToErrorCode(billingResult.getResponseCode())
                        );
                        return;
                    }

                    JSArray purchaseList = new JSArray();

                    for (Purchase purchase : purchases) {
                        if (isBarrierPurchase(purchase) && purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                            purchaseList.put(purchasePayload(purchase, false));
                        }
                    }

                    JSObject result = new JSObject();
                    result.put("purchases", purchaseList);
                    call.resolve(result);
                });
            }

            @Override
            public void onError(String code, String message) {
                call.reject(message, code);
            }
        });
    }

    @PluginMethod
    public void finishPurchase(PluginCall call) {
        String transactionId = call.getString("transactionId", "");

        if (transactionId.isEmpty()) {
            call.reject("A purchase token is required.", "MISSING_TRANSACTION_ID");
            return;
        }

        connectBillingClient(new ReadyCallback() {
            @Override
            public void onReady() {
                ConsumeParams params = ConsumeParams.newBuilder()
                    .setPurchaseToken(transactionId)
                    .build();

                ConsumeResponseListener listener = (billingResult, purchaseToken) -> {
                    if (
                        billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK ||
                        billingResult.getResponseCode() == BillingClient.BillingResponseCode.ITEM_NOT_OWNED
                    ) {
                        JSObject result = new JSObject();
                        result.put("finished", true);
                        call.resolve(result);
                    } else {
                        call.reject(
                            billingResult.getDebugMessage(),
                            responseCodeToErrorCode(billingResult.getResponseCode())
                        );
                    }
                };

                billingClient.consumeAsync(params, listener);
            }

            @Override
            public void onError(String code, String message) {
                call.reject(message, code);
            }
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        PluginCall call = pendingPurchaseCall;
        pendingPurchaseCall = null;

        if (call == null) return;

        int responseCode = billingResult.getResponseCode();

        if (responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            call.reject("Purchase cancelled.", "USER_CANCELLED");
            return;
        }

        if (responseCode != BillingClient.BillingResponseCode.OK) {
            call.reject(billingResult.getDebugMessage(), responseCodeToErrorCode(responseCode));
            return;
        }

        if (purchases == null || purchases.isEmpty()) {
            call.reject("No purchase was returned.", "PURCHASE_NOT_FOUND");
            return;
        }

        for (Purchase purchase : purchases) {
            if (!isBarrierPurchase(purchase)) continue;

            if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                call.resolve(purchasePayload(purchase, true));
                return;
            }

            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                call.resolve(purchasePayload(purchase, false));
                return;
            }
        }

        call.reject("The barrier purchase was not found.", "PURCHASE_NOT_FOUND");
    }

    private void loadBarrierProduct(ProductCallback callback) {
        connectBillingClient(new ReadyCallback() {
            @Override
            public void onReady() {
                if (barrierProduct != null) {
                    callback.onProduct(barrierProduct);
                    return;
                }

                QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(BARRIER_PRODUCT_ID)
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build();

                QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                    .setProductList(Collections.singletonList(product))
                    .build();

                billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsResult) -> {
                    if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        callback.onError(
                            responseCodeToErrorCode(billingResult.getResponseCode()),
                            billingResult.getDebugMessage()
                        );
                        return;
                    }

                    List<ProductDetails> productDetailsList = productDetailsResult.getProductDetailsList();

                    if (productDetailsList == null || productDetailsList.isEmpty()) {
                        callback.onError("PRODUCT_NOT_FOUND", "The barrier product is not available.");
                        return;
                    }

                    barrierProduct = productDetailsList.get(0);
                    callback.onProduct(barrierProduct);
                });
            }

            @Override
            public void onError(String code, String message) {
                callback.onError(code, message);
            }
        });
    }

    private void connectBillingClient(ReadyCallback callback) {
        if (billingClient.isReady()) {
            callback.onReady();
            return;
        }

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    callback.onReady();
                } else {
                    callback.onError(
                        responseCodeToErrorCode(billingResult.getResponseCode()),
                        billingResult.getDebugMessage()
                    );
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                barrierProduct = null;
            }
        });
    }

    private boolean isBarrierPurchase(Purchase purchase) {
        return purchase.getProducts().contains(BARRIER_PRODUCT_ID);
    }

    private JSObject productPayload(ProductDetails productDetails) {
        JSObject result = new JSObject();
        result.put("productId", productDetails.getProductId());
        result.put("displayName", productDetails.getName());
        result.put("quantity", BARRIER_QUANTITY);

        ProductDetails.OneTimePurchaseOfferDetails offer = selectOneTimeOffer(productDetails);
        if (offer != null) {
            result.put("displayPrice", offer.getFormattedPrice());
        }

        return result;
    }

    private JSObject purchasePayload(Purchase purchase, boolean pending) {
        JSObject result = new JSObject();
        result.put("transactionId", purchase.getPurchaseToken());
        result.put("productId", BARRIER_PRODUCT_ID);
        result.put("quantity", BARRIER_QUANTITY);
        result.put("pending", pending);
        return result;
    }

    private ProductDetails.OneTimePurchaseOfferDetails selectOneTimeOffer(ProductDetails productDetails) {
        ProductDetails.OneTimePurchaseOfferDetails offer = productDetails.getOneTimePurchaseOfferDetails();
        if (offer != null) return offer;

        List<ProductDetails.OneTimePurchaseOfferDetails> offers = productDetails.getOneTimePurchaseOfferDetailsList();
        if (offers != null && !offers.isEmpty()) return offers.get(0);

        return null;
    }

    private String responseCodeToErrorCode(int responseCode) {
        switch (responseCode) {
            case BillingClient.BillingResponseCode.USER_CANCELED:
                return "USER_CANCELLED";
            case BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED:
                return "ITEM_ALREADY_OWNED";
            case BillingClient.BillingResponseCode.ITEM_UNAVAILABLE:
                return "PRODUCT_NOT_FOUND";
            case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
                return "BILLING_UNAVAILABLE";
            case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED:
            case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE:
                return "SERVICE_UNAVAILABLE";
            default:
                return "BILLING_ERROR";
        }
    }

    private interface ReadyCallback {
        void onReady();
        void onError(String code, String message);
    }

    private interface ProductCallback {
        void onProduct(ProductDetails productDetails);
        void onError(String code, String message);
    }
}