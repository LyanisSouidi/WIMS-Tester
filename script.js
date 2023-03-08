document.getElementsByTagName("legend")[0].innerText = chrome.i18n.getMessage("serverSelection");
async function updateLink(name, url) {
    let tabURL = await chrome.tabs.query({currentWindow: true, active: true}).then(tabs => tabs[0].url);
    if (tabURL.includes("wims.cgi") && !tabURL.includes(url)) {
        let link = new URL(url);
        link.search = new URL(tabURL).search;
        let a = document.getElementsByTagName("a")[0];
        a.href = link.toString();
        a.innerText = chrome.i18n.getMessage("openCurrentPageOnServer") + `'${name}'`;
    }
}

async function load() {
    let serversList = await fetch(chrome.runtime.getURL("servers.json")).then((response) => response.json()).then((data) => data["servers"]);
    let preferredServer = await chrome.storage.sync.get('preferredServer').then(item => item.preferredServer);
    let tabURL = await chrome.tabs.query({currentWindow: true, active: true}).then(tabs => tabs[0].url);
    if (typeof preferredServer === "undefined" || !preferredServer.hasOwnProperty("url")) preferredServer =  serversList[0];
    for (let i = 0; i < serversList.length; i++) {
        if (!tabURL.includes(serversList[i].url)) {
            let div = document.createElement("div");
            let input = document.createElement("input");
            input.type = "radio";
            input.id = serversList[i].url;
            input.name = "server";
            input.value = serversList[i].name;
            if (preferredServer.url === serversList[i].url) input.checked = true;
            input.addEventListener("click", saveServer);
            div.appendChild(input);
            let label = document.createElement("label");
            label.for = serversList[i].name;
            label.innerText = serversList[i].name;
            div.appendChild(label);
            document.getElementById("servers").appendChild(div);
        }
    }
    updateLink(preferredServer.name, preferredServer.url);
}
load();
function saveServer(e) {
    chrome.storage.sync.set({ preferredServer: { name: e.target.value, url: e.target.id } });
    updateLink(e.target.value, e.target.id);
}
