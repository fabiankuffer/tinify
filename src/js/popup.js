function initPopups(){
    let popup_open = document.getElementsByClassName("popup-open");
    for (let i = 0; i < popup_open.length; i++){
        popup_open[i].addEventListener("click", openPopup);
    }

    let popup_close = document.getElementsByClassName("popup-close");
    for (let i = 0; i < popup_close.length; i++){
        popup_close[i].addEventListener("click", closePopup);
    }
}

function openPopup(){
    let popup_backgrounds = document.getElementsByClassName("popup-background");
    for (let i = 0; i < popup_backgrounds.length; i++){
        popup_backgrounds[i].style.display = "flex";
    }
}

function closePopup(){
    let popup_backgrounds = document.getElementsByClassName("popup-background");
    for (let i = 0; i < popup_backgrounds.length; i++){
        popup_backgrounds[i].style.display = "none";
    }
}