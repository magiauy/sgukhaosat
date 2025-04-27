import { CheckBoxIcon, MCIcon } from "../constants/icons.js";

function getIconForType(qType) {
    switch (qType) {
        case "MULTIPLE_CHOICE": return MCIcon;
        case "CHECKBOX": return CheckBoxIcon;
        default: return "";
    }
}

export { getIconForType };