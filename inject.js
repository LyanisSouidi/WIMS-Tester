function createLink(name, oldURL, newURL) {
    let e = document.createElement("a");
    e.className = "_wims_tester_link";
    e.innerText = "[" + browser.i18n.getMessage("openOnServer") + `'${name}']`;
    let link = new URL(newURL);
    link.search = new URL(oldURL).search;
    e.href = link.toString();
    e.target = "_blank";
    return e;
}

function updateLink(e, name, url) {
    e.innerText = "[" + browser.i18n.getMessage("openOnServer") + `'${name}']`;
    let link = new URL(url);
    link.search = new URL(e.href).search;
    e.href = link.toString();
}

async function load() {
    let serversList = await fetch(browser.runtime.getURL("servers.json")).then((response) => response.json()).then((data) => data["servers"]);
    let preferredServer = await browser.storage.sync.get('preferredServer').then(item => item.preferredServer);
    if (typeof preferredServer === "undefined" || !preferredServer.hasOwnProperty("url")) preferredServer =  serversList[0];

    let list = document.getElementsByClassName("wims_exo_item");
    for (let item of list) item.firstElementChild.after(createLink(preferredServer.name, item.firstElementChild.href, preferredServer.url));

    list = document.querySelectorAll('a[target="wims_exo"]');
    for (let item of list) item.after(createLink(preferredServer.name, item.href, preferredServer.url));

    list = document.querySelectorAll('ul[class="wims_home_result_list"] > li');
    for (let item of list) item.firstElementChild.after(createLink(preferredServer.name, item.firstElementChild.href, preferredServer.url));
}

let style = document.createElement('style');
style.textContent = "._wims_tester_link::before { content: ' '; } ._wims_tester_link { font-size: small; color: black; }";
document.head.append(style);

load();

browser.storage.sync.onChanged.addListener((changes) => {
    const changedItems = Object.keys(changes);
    for (const item of changedItems) {
        if (item == "preferredServer") {
            document.querySelectorAll('a[class="_wims_tester_link"]').forEach(e => updateLink(e, changes[item].newValue.name, changes[item].newValue.url));
        }
    }
});