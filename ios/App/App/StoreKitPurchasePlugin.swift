import Capacitor
import Foundation
import StoreKit

@objc(StoreKitPurchasePlugin)
public class StoreKitPurchasePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoreKitPurchasePlugin"
    public let jsName = "StoreKitPurchase"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getBarrierProduct", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchaseBarrier", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unfinishedPurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finishPurchase", returnType: CAPPluginReturnPromise)
    ]

    private let barrierProductID = "com.imageworkshub.imagegames.barrier3"
    private let barrierQuantity = 3

    @objc public func getBarrierProduct(_ call: CAPPluginCall) {
        Task {
            do {
                guard let product = try await loadBarrierProduct() else {
                    call.reject("The barrier product is not available.", "PRODUCT_NOT_FOUND")
                    return
                }

                call.resolve([
                    "productId": product.id,
                    "displayName": product.displayName,
                    "displayPrice": product.displayPrice,
                    "quantity": barrierQuantity
                ])
            } catch {
                call.reject(error.localizedDescription, "PRODUCT_LOAD_FAILED", error)
            }
        }
    }

    @objc public func purchaseBarrier(_ call: CAPPluginCall) {
        Task {
            do {
                guard let product = try await loadBarrierProduct() else {
                    call.reject("The barrier product is not available.", "PRODUCT_NOT_FOUND")
                    return
                }

                let result = try await product.purchase()

                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        call.resolve(purchasePayload(for: transaction))
                    case .unverified(_, let error):
                        call.reject(error.localizedDescription, "UNVERIFIED_TRANSACTION", error)
                    }
                case .pending:
                    call.resolve(["pending": true])
                case .userCancelled:
                    call.reject("Purchase cancelled.", "USER_CANCELLED")
                @unknown default:
                    call.reject("Unknown purchase result.", "UNKNOWN_PURCHASE_RESULT")
                }
            } catch {
                call.reject(error.localizedDescription, "PURCHASE_FAILED", error)
            }
        }
    }

    @objc public func unfinishedPurchases(_ call: CAPPluginCall) {
        Task {
            var purchases: [[String: Any]] = []

            for await verification in Transaction.unfinished {
                guard case .verified(let transaction) = verification else { continue }
                guard transaction.productID == barrierProductID else { continue }
                purchases.append(purchasePayload(for: transaction))
            }

            call.resolve(["purchases": purchases])
        }
    }

    @objc public func finishPurchase(_ call: CAPPluginCall) {
        guard let transactionID = call.getString("transactionId"), !transactionID.isEmpty else {
            call.reject("A transaction ID is required.", "MISSING_TRANSACTION_ID")
            return
        }

        Task {
            for await verification in Transaction.unfinished {
                guard case .verified(let transaction) = verification else { continue }
                guard String(transaction.id) == transactionID else { continue }

                await transaction.finish()
                call.resolve(["finished": true])
                return
            }

            call.resolve(["finished": false])
        }
    }

    private func loadBarrierProduct() async throws -> Product? {
        let products = try await Product.products(for: [barrierProductID])
        return products.first(where: { $0.id == barrierProductID })
    }

    private func purchasePayload(for transaction: Transaction) -> [String: Any] {
        return [
            "transactionId": String(transaction.id),
            "productId": transaction.productID,
            "quantity": barrierQuantity,
            "pending": false
        ]
    }
}
