document.getElementsByTagName("legend")[0].innerText = browser.i18n.getMessage("serverSelection");
async function updateLink(name, url) {
    let link = new URL(url);
    let tabURL = await browser.tabs.query({currentWindow: true, active: true}).then(tabs => tabs[0].url);
    link.search = new URL(tabURL).search;
    let a = document.getElementsByTagName("a")[0];
    a.href = link.toString();
    a.innerText = browser.i18n.getMessage("openCurrentPageOnServer") + `'${name}'`;
}

async function load(qualifiedName, value) {
    let serversList = await fetch(browser.runtime.getURL("servers.json")).then((response) => response.json()).then((data) => data["servers"]);
    let preferredServer = await browser.storage.sync.get('preferredServer').then(item => item.preferredServer);
    if (typeof preferredServer === "undefined" || !preferredServer.hasOwnProperty("url")) preferredServer =  serversList[0];
    for (let i = 0; i < serversList.length; i++) {
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
    updateLink(preferredServer.name, preferredServer.url);
}
load();
function saveServer(e) {
    browser.storage.sync.set({ preferredServer: { name: e.target.value, url: e.target.id } });
    updateLink(e.target.value, e.target.id);
}
