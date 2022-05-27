"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("@remixproject/engine");
const profile = {
    name: 'settings',
    displayName: 'Settings',
    methods: ['getGithubAccessToken', 'get'],
    events: [],
    icon: 'assets/img/settings.webp',
    description: 'Remix-IDE settings',
    kind: 'settings',
    documentation: '',
    version: '0.0.1',
};
class SettingsModule extends engine_1.Plugin {
    constructor() {
        super(profile);
    }
    getGithubAccessToken() {
        return '';
    }
    setContext(context) {
        this.context = context;
    }
    get(key) {
        if (key === 'settings/generate-contract-metadata') {
            return true;
        }
        return this.context.workspaceState.get(key);
    }
    set(key, value) {
        this.context.workspaceState.update(key, value);
    }
}
exports.default = SettingsModule;
//# sourceMappingURL=settings.js.map