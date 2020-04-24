var typing = false;
if (typing) {
    let messageWrapper = document.createElement("div");
    let messageBubble = document.createElement("p");
    messageWrapper.className = "messageWrapper";
    messageBubble.className = "messageBubble received";
    messageBubble.innerHTML = document.getElementById("textarea").value;
    messageWrapper.appendChild(messageBubble);
    document.getElementById("messagesWrapper").appendChild(messageWrapper);
}

function onTextInput() {
    var key = window.event.keyCode;
    if (key === 13) {
        let text = document.getElementById("textarea").value;
        if (text != "") {
            let messageWrapper = document.createElement("div");
            let messageBubble = document.createElement("p");
            messageWrapper.className = "messageWrapper";
            if (isEmoji(text)) messageBubble.className = "emojiBubble sent";
            else messageBubble.className = "messageBubble sent sentBackground";
            messageBubble.innerHTML = text;
            messageWrapper.appendChild(messageBubble);
            document.getElementById("messagesWrapper").appendChild(messageWrapper);
            updateScroll();
            document.getElementById("textarea").value = '';
            return true;
        } else return false;
    } else {
        return false;
    }
}

function updateScroll() {
    var element = document.getElementById("messagesWrapper");
    element.scrollTop = element.scrollHeight;
}

function isEmoji(str) {
    var ranges = [
        '(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])' // U+1F680 to U+1F6FF
    ];
    if (str.match(ranges.join('|'))) {
        return true;
    } else {
        return false;
    }
}

function myFunction() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName('li');

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("p")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}