var typing = false;
var canPublish = true;
var throttleTime = 500;

var userData;
var conversations = [];
var activeUUID;

async function getData(url) {
    const data = await fetch(url)
        .then(
            function (response) {
                if (response.status !== 200) {
                    console.log('There was a problem. Status Code: ' +
                        response.status);
                    return;
                }
                return response.json();
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });
    return data;
}

async function loadUserData() {
    userData = await getData("./user.json");
    console.log("user data", userData);
    userUUID = userData.uuid;
    document.getElementById("userName").innerHTML = userData.name;
    document.getElementById("userStatus").innerHTML = userData.status;
    document.getElementById("userStatus").className = userData.status;
    document.getElementById("userAvatar").src = "user.png";

    userData.friends.sort((a, b) => (a.importance > b.importance) ? 1 : -1)

    for (let i = 0; i < userData.conversations.length; i++) {
        conversations[i] = await getData("conversations/" + userData.conversations[i].uuid + ".json");
        console.log("conversation with " + conversations[i].name, conversations[i]);
    }
    activeUUID = userData.conversations[0].uuid;

    renderFriendsList();
}
loadUserData();

async function renderFriendsList() {
    userData.friends.sort((a, b) => (a.importance > b.importance) ? -1 : 1)
    document.getElementById("myUL").innerHTML = "";
    for (let i = 0; i < userData.friends.length; i++) {
        let friendData = await getData("users/" + userData.friends[i].uuid + ".json");
        console.log("friends data: ", friendData);

        let imgWrapper = document.createElement("div");
        imgWrapper.className = "imgWrapper";
        let img = document.createElement("img");
        img.src = "users/" + friendData.uuid + ".png";
        imgWrapper.appendChild(img);

        let infoWrapper = document.createElement("div");
        infoWrapper.className = "infoWrapper";
        let name = document.createElement("p");
        name.className = "name";
        name.style.marginTop = "8px";
        name.innerHTML = friendData.name;
        infoWrapper.appendChild(name);

        if (findObjectByKey(userData.conversations, "uuid", userData.friends[i].uuid)) {
            let message = document.createElement("p");
            message.className = "message";
            name.style.marginTop = "0px";
            let objIndex = userData.friends.findIndex((obj => obj.uuid == userData.friends[i].uuid));
            message.innerHTML = conversations[objIndex].messages[conversations[objIndex].messages.length - 1].message;
            infoWrapper.appendChild(message);
        }

        let li = document.createElement("li");
        li.id = friendData.uuid;
        li.appendChild(imgWrapper);
        li.appendChild(infoWrapper);
        li.setAttribute('onclick', "changeConv('" + friendData.uuid + "')");
        document.getElementById("myUL").appendChild(li);
    }
    changeConv(activeUUID);
}

function changeConv(uuid) {
    document.getElementById("messagesWrapper").innerHTML = "";
    activeUUID = uuid;
    renderConv(uuid);
}

function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return false;
}

function renderConv(uuid) {
    let convData;

    for (let i = 0; i < userData.friends.length; i++) {
        document.getElementById(userData.friends[i].uuid).className = "";
    }

    document.getElementById(uuid).className = "activeConv";
    if (findObjectByKey(conversations, "uuid", uuid)) {
        convData = findObjectByKey(conversations, "uuid", uuid);
        document.getElementById("convName").innerHTML = convData.name;
        convData.messages.sort((a, b) => (a.time > b.time) ? 1 : -1)
        if (convData.messages.length > 0) {
            for (let i = 0; i < convData.messages.length; i++) {
                if (convData.messages[i].user != userUUID) {
                    renderMessage(convData.messages[i].message, "received");
                } else {
                    renderMessage(convData.messages[i].message, "sent");
                }
            }
        } else {
            let zeroMsg = document.createElement("div");
            zeroMsg.id = "zeroMessages";
            zeroMsg.style.display = "block";
            zeroMsg.innerHTML = "say something nice :3"
            document.getElementById("messagesWrapper").appendChild(zeroMsg);
        }
    } else {
        newConv(uuid);
    }
}

function newConv(uuid) {
    conversations[conversations.length] = {
        "uuid": uuid,
        "name": findObjectByKey(userData.friends, "uuid", uuid).name,
        "messages": []
    };
    userData.conversations[userData.conversations.length] = {
        "name": findObjectByKey(userData.friends, "uuid", uuid).name,
        "uuid": uuid,
        "time": Date.now()
    };
    renderConv(uuid);
    // renderFriendsList();
}

function renderMessage(message, type) {
    if (type === "received") {
        let messageWrapper = document.createElement("div");
        let messageBubble = document.createElement("p");
        messageWrapper.className = "messageWrapper";
        if (isEmoji(message)) messageBubble.className = "emojiBubble";
        else messageBubble.className = "messageBubble received receivedBackground";
        messageBubble.innerHTML = message;
        messageWrapper.appendChild(messageBubble);
        document.getElementById("messagesWrapper").appendChild(messageWrapper);
    } else if (type === "sent") {
        let messageWrapper = document.createElement("div");
        let messageBubble = document.createElement("p");
        let seenBubble = document.createElement("div");
        seenBubble.className = "seen";
        seenBubble.innerHTML = "seen";
        messageWrapper.className = "messageWrapper";
        if (isEmoji(message)) messageBubble.className = "emojiBubble sent";
        else messageBubble.className = "messageBubble sent sentBackground";
        messageBubble.innerHTML = message;
        messageWrapper.appendChild(messageBubble);
        messageWrapper.appendChild(seenBubble);
        document.getElementById("messagesWrapper").appendChild(messageWrapper);
    }
    updateScroll();
}

function receivedMessage(uuid, message) {
    let convData = findObjectByKey(conversations, "uuid", uuid);
    console.log("convData", convData);
    convData.messages[convData.messages.length] = {
        "time": Date.now(),
        "user": uuid,
        "message": message
    };
    if (uuid === activeUUID) {
        renderMessage(message, "received");
    }
}

function onTextInput() {
    var key = window.event.keyCode;
    if (key === 13) {
        let text = document.getElementById("textarea").value;
        if (text != "") {
            renderMessage(text, "sent")
            document.getElementById("textarea").value = '';

            let convData = findObjectByKey(conversations, "uuid", activeUUID);
            console.log("convData", convData);
            convData.messages[convData.messages.length] = {
                "time": Date.now(),
                "user": userUUID,
                "message": text
            }

            // najpóźniejsza wiadomość na górze
            // objIndex = userData.friends.findIndex((obj => obj.uuid == activeUUID));
            // userData.friends[objIndex].importance = Date.now();
            // renderFriendsList();

            return true;
        } else return false;
    } else {
        if (canPublish) {
            console.log("typing...");
            canPublish = false;
            setTimeout(function () {
                canPublish = true;
            }, throttleTime);
        }
    }
}


function typingTimeout() {
    if (typing) {
        console.log("TYPING...");
    } else {
        console.log("NOT TYPING...");
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

async function searchUser() {
    var key = window.event.keyCode;

    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    filter2 = input.value;
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName('li');

    if (key === 13) {

    } else {
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
}