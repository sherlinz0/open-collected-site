const LANGUAGE_TYPE = {
  zh: "zh",
  en: "en",
};

const ele_btn_add = document.querySelector(".btn--add");
const ele_btn_delete = document.querySelector(".btn--delete");
const ele_btn_edit = document.querySelector(".btn--edit");
const ele_btn_confirm = document.querySelector(".btn--confirm");
const ele_check_all = document.querySelector(".check--all");

let _collectedSites = [];
let _settings = {};
let isDeleting = false;
let isEditing = false;

const initPage = async () => {
  await initData();
  initView();
};

const initData = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(
      ["collectedSites", "settings"],
      ({ collectedSites, settings }) => {
        _collectedSites = collectedSites;
        _settings = settings;

        _collectedSites.forEach(insertSiteView);

        resolve({ collectedSites, settings });
      }
    );
  });
};

const initView = () => {
  const ele_content_head_text_address = document.querySelector(
    ".content_head_text_address"
  );
  const ele_content_head_text_description = document.querySelector(
    ".content_head_text_description"
  );

  switch (_settings.language) {
    case LANGUAGE_TYPE.zh: {
      ele_content_head_text_address.innerText = "地址";
      ele_content_head_text_description.innerText = "描述";
      break;
    }

    case LANGUAGE_TYPE.en: {
      ele_content_head_text_address.innerText = "Address";
      ele_content_head_text_description.innerText = "Description";
      break;
    }
  }
};

initPage();

const insertSite = () => {
  if (isDeleting || isEditing) {
    isDeleting = false;
    isEditing = false;
    hideElements();
  }

  const site = getInputSiteData();
  if (site === undefined) return;
  _collectedSites.push(site);

  insertSiteView(site);

  chrome.storage.sync.set({ collectedSites: _collectedSites });
};

const getInputSiteData = (defaultAddress = "", defaultDescription = "") => {
  const site = {
    address: "",
    description: "",
    id: getRandomString(12, "123456abcdef"),
  };

  let promptStrForAddress = "";
  switch (_settings.language) {
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
    const preAddress = prompt(promptStrForAddress, defaultAddress);
    if (preAddress === null) return;
    if (!preAddress.includes("http://") && !preAddress.includes("https://"))
      continue;
    site.address = preAddress;
    break;
  }

  let promptStrForDesc = "";
  switch (_settings.language) {
    case LANGUAGE_TYPE.zh: {
      promptStrForDesc = "请输入该对网站的描述信息!";
      break;
    }

    case LANGUAGE_TYPE.en: {
      promptStrForDesc = "Please input the description about the site!";
      break;
    }
  }

  site.description = prompt(promptStrForDesc, defaultDescription) || "";

  return site;
};

const getRandomString = (length, chars) => {
  let result = "";
  for (var i = length; i > 0; --i)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const insertSiteView = (site) => {
  const ele_sites = document.querySelector(".sites");

  const ele_site_check = document.createElement("input");
  ele_site_check.setAttribute("class", "check check--other hidden");
  ele_site_check.setAttribute("type", "checkbox");
  ele_site_check.setAttribute("id", "check-" + site.id);
  ele_site_check.setAttribute("value", site.id);
  ele_site_check.addEventListener("click", checkEvent);

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

  const ele_site = document.createElement("div");
  ele_site.setAttribute("class", "site");
  ele_site.appendChild(ele_a);

  const ele_site_wrapper = document.createElement("li");
  ele_site_wrapper.setAttribute("class", "site_wrapper");
  ele_site_wrapper.setAttribute("id", site.id);
  ele_site_wrapper.appendChild(ele_site_check);
  ele_site_wrapper.appendChild(ele_site);

  ele_sites.appendChild(ele_site_wrapper);
};

const checkEvent = () => {
  updateCheckAllDisplay();
};

const updateCheckAllDisplay = () => {
  const ele_other_checks = document.querySelectorAll(".check--other");
  let checkCount = 0;

  for (const check of ele_other_checks) {
    if (check.checked) {
      checkCount++;
    }
  }

  if (checkCount === 0) {
    ele_check_all.checked = false;
    ele_check_all.indeterminate = false;
  } else if (checkCount === ele_other_checks.length) {
    ele_check_all.checked = true;
    ele_check_all.indeterminate = false;
  } else {
    ele_other_checks.checked = false;
    ele_check_all.indeterminate = true;
  }
};

const showHiddenElements = () => {
  const ele_other_checks = document.querySelectorAll(".check--other");

  ele_other_checks.forEach((check) => {
    check.setAttribute(
      "class",
      check.getAttribute("class").replace("hidden", "")
    );
  });

  ele_check_all.setAttribute(
    "class",
    ele_check_all.getAttribute("class").replace("hidden", "")
  );

  ele_btn_confirm.setAttribute(
    "class",
    ele_btn_confirm.getAttribute("class").replace("hidden", "")
  );
};

const hideElements = () => {
  const ele_other_checks = document.querySelectorAll(".check--other");

  ele_other_checks.forEach((check) => {
    check.checked = false;
    check.setAttribute("class", check.getAttribute("class") + "hidden");
  });

  ele_check_all.checked = false;
  ele_check_all.indeterminate = false;
  ele_check_all.setAttribute(
    "class",
    ele_check_all.getAttribute("class") + "hidden"
  );

  ele_btn_confirm.setAttribute(
    "class",
    ele_btn_confirm.getAttribute("class") + "hidden"
  );
};

const confirmBtnEvent = () => {
  const checkedChecks = [];

  if (isDeleting) {
    const ele_other_checks = document.querySelectorAll(".check--other");
    ele_other_checks.forEach((check) => {
      if (check.checked) checkedChecks.push(check);
    });

    if (checkedChecks.length === 0) {
      let alertStr = "";
      switch (_settings.language) {
        case LANGUAGE_TYPE.zh: {
          alertStr = "未选择选项!";
          break;
        }

        case LANGUAGE_TYPE.en: {
          alertStr = "Did not select a item!";
          break;
        }
      }
      alert(alertStr);
    } else {
      deleteSites(checkedChecks);
    }

    isDeleting = false;
  }

  if (isEditing) {
    const ele_other_checks = document.querySelectorAll(".check--other");
    ele_other_checks.forEach((check) => {
      if (check.checked) checkedChecks.push(check);
    });

    if (checkedChecks.length === 0) {
      let alertStr = "";
      switch (_settings.language) {
        case LANGUAGE_TYPE.zh: {
          alertStr = "未选择选项!";
          break;
        }

        case LANGUAGE_TYPE.en: {
          alertStr = "Did not select a item!";
          break;
        }
      }
      alert(alertStr);
    } else if (checkedChecks.length > 1) {
      let alertStr = "";
      switch (_settings.language) {
        case LANGUAGE_TYPE.zh: {
          alertStr = "同时只能选择一项进行编辑!";
          break;
        }

        case LANGUAGE_TYPE.en: {
          alertStr = "You can only select one item to edit!";
          break;
        }
      }
      alert(alertStr);
    } else {
      let siteToDel;

      for (const site of _collectedSites) {
        if (site.id === checkedChecks[0].id.replace("check-", ""))
          siteToDel = site;
      }

      editSite(siteToDel);
    }

    isEditing = false;
  }

  hideElements();
};

const deleteSites = (sites) => {
  for (const siteToDel of sites) {
    for (let i = 0; i < _collectedSites.length; i++) {
      if (siteToDel.id.replace("check-", "") === _collectedSites[i].id) {
        _collectedSites.splice(i, 1);
      }
    }
  }

  history.go(0);

  chrome.storage.sync.set({ collectedSites: _collectedSites });
};

const editSite = (siteToEdit) => {
  const newSite = getInputSiteData(siteToEdit.address, siteToEdit.description);
  if (newSite === undefined) return;

  _collectedSites.forEach((site) => {
    if (site.id === siteToEdit.id) {
      site.address = newSite.address;
      site.description = newSite.description;
    }
  });

  history.go(0);

  chrome.storage.sync.set({ collectedSites: _collectedSites });
};

const deleteBtnEvent = () => {
  if (isEditing) isEditing = false;

  isDeleting = !isDeleting;
  if (isDeleting) showHiddenElements();
  else hideElements();
};

const editBtnEvent = () => {
  if (isDeleting) isDeleting = false;

  isEditing = !isEditing;
  if (isEditing) showHiddenElements();
  else hideElements();
};

const checkAll = () => {
  const ele_other_checks = document.querySelectorAll(".check--other");

  if (ele_check_all.checked) {
    for (let check of ele_other_checks) {
      check.checked = true;
    }
  } else {
    for (let check of ele_other_checks) {
      check.checked = false;
    }
  }
};

ele_btn_add.addEventListener("click", insertSite);
ele_btn_delete.addEventListener("click", deleteBtnEvent);
ele_btn_edit.addEventListener("click", editBtnEvent);
ele_btn_confirm.addEventListener("click", confirmBtnEvent);
ele_check_all.addEventListener("click", checkAll);
