const LANGUAGE_TYPE = {
  zh: "zh",
  en: "en",
};

const ele_btn_add = document.querySelector(".btn--add");
const ele_btn_delete = document.querySelector(".btn--delete");
const ele_btn_edit = document.querySelector(".btn--edit");
const ele_btn_confirm = document.querySelector(".btn--confirm");

let _collectedSites = [];
let _settings = {};

const initSites = () => {
  chrome.storage.sync.get(
    ["collectedSites", "settings"],
    ({ collectedSites, settings }) => {
      _collectedSites = collectedSites;
      _settings = settings;

      _collectedSites.forEach(insertSiteView);
    }
  );
};

initSites();

const insertSite = () => {
  const site = getInputSiteData();
  if (site === undefined) return;

  _collectedSites.push(site);
  insertSiteView(site);
  chrome.storage.sync.set({ collectedSites: _collectedSites });
};

const insertSiteView = (site) => {
  const ele_sites = document.querySelector(".sites");

  const ele_site_text_address = document.createElement("span");
  ele_site_text_address.setAttribute("class", "site_text site_text_address");
  ele_site_text_address.innerText = site.address;
  const ele_site_text_description = document.createElement("span");
  ele_site_text_description.setAttribute(
    "class",
    "site_text site_text_address"
  );
  ele_site_text_description.innerText = site.description;

  const ele_a = document.createElement("a");
  ele_a.setAttribute("href", site.address);
  ele_a.setAttribute("target", "_blank");
  ele_a.appendChild(ele_site_text_address);
  ele_a.appendChild(ele_site_text_description);

  const ele_site = document.createElement("li");
  ele_site.setAttribute("class", "site");
  ele_site.setAttribute("id", site.id);
  ele_site.appendChild(ele_a);

  ele_sites.appendChild(ele_site);
};

const getInputSiteData = () => {
  const site = {
    address: "",
    description: "",
    id: getRandomString(12, "123456abcdef"),
  };

  let promptStrForAddress = "";
  switch (_settings._language) {
    case LANGUAGE_TYPE.zh: {
      promptStrForAddress =
        "请输入一个包含 http:// 或 https:// 前缀的有效地址!";
        break;
    }

    case LANGUAGE_TYPE.en: {
      promptStrForAddress =
        'Please input a valid address which includes prefix "http://" or "https://"!';
        break;
    }
  }

  while (true) {
    const preAddress = prompt(promptStrForAddress);
    if (preAddress === null) return;
    if (!preAddress.includes("http://") && !preAddress.includes("https://"))
      continue;
    site.address = preAddress;
    break;
  }

  let promptStrForDesc = "";
  switch (_settings._language) {
    case LANGUAGE_TYPE.zh: {
      promptStrForDesc = "请输入该对网站的描述信息!";
    }

    case LANGUAGE_TYPE.en: {
      promptStrForDesc = "Please input the description about the site!";
    }
  }

  site.description = prompt(promptStrForDesc) || "";

  return site;
};

const getRandomString = (length, chars) => {
  let result = "";
  for (var i = length; i > 0; --i)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

ele_btn_add.addEventListener("click", insertSite);
