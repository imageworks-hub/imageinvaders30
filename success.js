// バリア3回を保存
localStorage.setItem("barrier","3");

// 3秒後にタイトルへ戻る
setTimeout(function(){

    location.href = "./index.html";

},3000);