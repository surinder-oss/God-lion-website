(function(){
  if(sessionStorage.getItem("scrollCtaDismissed"))return;
  var c=document.getElementById("scrollCta");
  if(!c)return;
  var shown=false;
  window.addEventListener("scroll",function(){
    if(shown)return;
    var p=(window.scrollY+window.innerHeight)/document.documentElement.scrollHeight;
    if(p>0.6){c.classList.add("visible");shown=true}
  });
})();
function dismissScrollCta(){
  var c=document.getElementById("scrollCta");
  if(c)c.classList.remove("visible");
  sessionStorage.setItem("scrollCtaDismissed","1");
}
