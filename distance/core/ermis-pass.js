
Object.defineProperty(exports, "__esModule", { value: true });
class ErmisPass {
    constructor(name) {
        this.offscreen = false;
        this.name = name;
        this.canResize = true;
        this.readPixels = false;
        this.samples = 8;
    }
    getVersionES(isGL2) {
        return 2;
    }
    getExtensions(isGL2) {
        return "";
    }
    onInit(script, effect, app) { }
}
exports.ErmisPass = ErmisPass;
