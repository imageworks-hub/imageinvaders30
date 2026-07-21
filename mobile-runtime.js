(function(){
    "use strict";

    document.documentElement.classList.add("native-app");

    window.__nativeBootErrors = [];
    window.addEventListener("error",function(event){
        window.__nativeBootErrors.push(event.message || "Unknown script error");
    });
    window.addEventListener("unhandledrejection",function(event){
        window.__nativeBootErrors.push(String(event.reason || "Unhandled promise rejection"));
    });

    const accessCounter = document.getElementById("accessCounter");
    const shopButton = document.getElementById("shopBtn");
    const shopScreen = document.getElementById("shopScreen");
    const buyButton = document.getElementById("buyBtn");
    const saveMessage = document.getElementById("saveMessage");
    const startButton = document.getElementById("startBtn");
    const capacitor = window.Capacitor;
    const isNative = Boolean(
        capacitor &&
        typeof capacitor.isNativePlatform === "function" &&
        capacitor.isNativePlatform()
    );
    const platform = capacitor && typeof capacitor.getPlatform === "function"
        ? capacitor.getPlatform()
        : "";
    const store = capacitor && capacitor.Plugins
        ? (
            platform === "android"
                ? capacitor.Plugins.GooglePlayPurchase
                : capacitor.Plugins.StoreKitPurchase
        )
        : null;
    const processedTransactionsKey = platform === "android"
        ? "processedGooglePlayPurchases"
        : "processedStoreKitTransactions";

    if(accessCounter){
        accessCounter.style.display = "none";
    }

    if(!isNative || !store){
        if(shopButton){
            shopButton.style.display = "none";
        }
        if(shopScreen){
            shopScreen.style.display = "none";
        }
    }else{
        configureNativeStore();
    }

    document.addEventListener("contextmenu",function(event){
        event.preventDefault();
    });

    async function configureNativeStore(){
        try{
            const product = await store.getBarrierProduct();
            const label = shopScreen ? shopScreen.querySelector("label") : null;

            if(label && product.displayPrice){
                label.textContent =
                    "\u88ab\u5f3e3\u56de\u5206\u30ce\u30fc\u30c0\u30e1\u30fc\u30b8 " +
                    "\u30d0\u30ea\u30a2\uff08" + product.displayPrice + "/1\u56de\uff09";
            }
        }catch(error){
            if(buyButton){
                buyButton.disabled = true;
                buyButton.textContent = "\u8cfc\u5165\u6e96\u5099\u4e2d";
            }
        }

        if(buyButton){
            buyButton.onclick = purchaseBarrier;
        }

        recoverUnfinishedPurchases();
    }

    async function purchaseBarrier(){
        if(!buyButton)return;

        const originalText = buyButton.textContent;
        buyButton.disabled = true;
        buyButton.textContent = "\u51e6\u7406\u4e2d...";

        try{
            const purchase = await store.purchaseBarrier();

            if(purchase.pending){
                showStoreMessage("\u8cfc\u5165\u306e\u627f\u8a8d\u5f85\u3061\u3067\u3059");
            }else{
                await deliverPurchase(purchase);
                showStoreMessage("\u8cfc\u5165\u5b8c\u4e86\uff01 \u30d0\u30ea\u30a23\u56de");
                if(shopScreen){
                    shopScreen.style.display = "none";
                }
            }
        }catch(error){
            if(!error || error.code !== "USER_CANCELLED"){
                showStoreMessage("\u8cfc\u5165\u3092\u5b8c\u4e86\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f");
            }
        }finally{
            buyButton.disabled = false;
            buyButton.textContent = originalText;
        }
    }

    async function recoverUnfinishedPurchases(){
        try{
            const result = await store.unfinishedPurchases();
            const purchases = Array.isArray(result.purchases) ? result.purchases : [];

            for(const purchase of purchases){
                await deliverPurchase(purchase);
            }
        }catch(error){
            window.__nativeBootErrors.push(String(error));
        }
    }

    async function deliverPurchase(purchase){
        const transactionId = String(purchase.transactionId || "");
        if(!transactionId)return;

        const processed = loadProcessedTransactions();

        if(!processed.includes(transactionId)){
            const currentBarrier = Number(localStorage.getItem("barrier")) || 0;
            const quantity = Math.max(1,Number(purchase.quantity) || 3);

            localStorage.setItem("barrier",String(currentBarrier + quantity));
            processed.push(transactionId);
            localStorage.setItem(
                processedTransactionsKey,
                JSON.stringify(processed.slice(-200))
            );

            if(startButton){
                startButton.classList.add("purchased");
            }
        }

        await store.finishPurchase({transactionId:transactionId});
    }

    function loadProcessedTransactions(){
        try{
            const transactions = JSON.parse(
                localStorage.getItem(processedTransactionsKey) || "[]"
            );
            return Array.isArray(transactions) ? transactions : [];
        }catch(error){
            return [];
        }
    }

    function showStoreMessage(message){
        if(!saveMessage)return;

        saveMessage.textContent = message;
        saveMessage.style.display = "block";

        setTimeout(function(){
            saveMessage.style.display = "none";
        },1800);
    }
})();
