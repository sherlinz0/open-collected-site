const LANGUAGE_TYPE = {
  zh: "zh",
  en: "en",
};

const LANGUAGES_ZH = [
  { type: "zh", text: "中文" },
  { type: "en", text: "英文" },
];

const LANGUAGES_EN = [
  { type: "zh", text: "Chinese" },
  { type: "en", text: "English" },
];

const ele_btn_confirm = document.querySelector(".btn--confirm");
const ele_select_lang = document.querySelector(".setting--lang > select");

let _settings = {};

const initPage = async () => {
  await initSettings();
  initView();
};

const initSettings = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("settings", ({ settings }) => {
      _settings = settings;
      resolve(_settings);
    });
  });
};

const initView = () => {
  const ele_h2 = document.querySelector("h2");
  const ele_setting_header_lang = document.querySelector(
    ".setting_header--lang"
  );

  switch (_settings.language) {
    case LANGUAGE_TYPE.zh: {
      ele_h2.innerText = "设置";
      ele_setting_header_lang.innerHTML = "语言:";
      ele_btn_confirm.innerText = "确定";
      initSelectLangsView(LANGUAGES_ZH);

      break;
    }

    case LANGUAGE_TYPE.en: {
      ele_h2.innerText = "Settings";
      ele_setting_header_lang.innerHTML = "Language:";
      ele_btn_confirm.innerHTML = "Confirm";
      initSelectLangsView(LANGUAGES_EN);

      break;
    }
  }
};

const initSelectLangsView = (langs) => {
  for (let lang of langs) {
    const option = document.createElement("option");
    option.innerText = lang.text;
    option.setAttribute("value", lang.type);
    if(lang.type === _settings.language) option.setAttribute("selected", true);
    ele_select_lang.append(option);
  }
};

initPage();

const confirmSettings = () => {
  _settings = {
    language: ele_select_lang.value,
  };
  chrome.storage.sync.set({ settings: _settings });

  let alertStr = "";
  switch (_settings.language) {
    case LANGUAGE_TYPE.zh: {
      alertStr = "成功应用设置!";
      break;
    }

    case LANGUAGE_TYPE.en: {
      alertStr = "Successfully apply new settings!";
      break;
    }
  }

  history.go(0);
  alert(alertStr);
};

ele_btn_confirm.addEventListener("click", confirmSettings);
