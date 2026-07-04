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

    if(accessCounter){
        accessCounter.style.display = "none";
    }

    // StoreKit purchase replaces the web Payment Link before App Store release.
    if(shopButton){
        shopButton.style.display = "none";
    }

    if(shopScreen){
        shopScreen.style.display = "none";
    }

    document.addEventListener("contextmenu",function(event){
        event.preventDefault();
    });
})();
