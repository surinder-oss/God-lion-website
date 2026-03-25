(function(){
  var t=document.getElementById("whatsappTooltip"),f=document.getElementById("whatsappFloat");
  if(!t||!f)return;
  if(window.innerWidth<=960){t.classList.add("mobile-show");setTimeout(function(){t.classList.remove("mobile-show")},4000)}
  var ft=document.querySelector("footer");
  if(!ft)return;
  window.addEventListener("scroll",function(){f.classList.toggle("at-footer",ft.getBoundingClientRect().top<window.innerHeight)});
})();
