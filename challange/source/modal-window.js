;(function(document, window, undefined) {
"use strict";
var $        = function (id) { return document.getElementById(id); },
    $modal   = $("modal-window"),
    $msg     = $("modal-window-msg"),
    $close   = $("modal-window-close"),
    $overlay = $("overlay");

function replace(text, tmpl) {
    var i;

    for (i in tmpl)
    {
        if (tmpl.hasOwnProperty(i))
        {
            text = text.replace(new RegExp("{{"+i+"}}", "gi"), tmpl[i]);
        }
    }
    
    return text;
}

function showModal(id, tmpl) {
    var style = $modal.style,
        elem  = $(id);
        
    elem.className = "";
        
    game.Modal.currentContent = elem;
    $msg.appendChild(elem);

    // Centrar Ventana
    var width = $modal.offsetWidth;

    style.marginLeft = (-width / 2) + "px";

    // Mostrar
    $modal.className = "modal";
    $overlay.className = "";
}

function closeModal(e) {
    e && e.preventDefault();
    $modal.className = "modal hide";
    $overlay.className = "hide";
    var current = game.Modal.currentContent;
    setTimeout(function() {
        if (!current) return;
        current.className = "hide";
        document.body.appendChild(current);
    }, 600);

    return false;
}

var event = Cevent.isTouchDevice ? "touchstart" : "click";
Cevent.addEventListener($overlay, event, closeModal);
Cevent.addEventListener($close, event, closeModal);

window.game = window.game || {};

game.Modal = {
    open: showModal,
    close: closeModal
};

}(document, window));
