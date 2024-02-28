import {Injectable} from '@angular/core';
import {ScriptStore} from './script.store';

declare var document: any;

@Injectable({
    providedIn: 'root'
  })
export class ScriptService {

private scripts: any = {};

constructor() {
    ScriptStore.forEach((script: any) => {
        this.scripts[script.name] = {
            loaded: false,
            src: script.src
        };
    });
}

load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
}


unloadScript(name: string) {
  return new Promise((resolve, reject) => {
    let scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.indexOf(this.scripts[name].src) !== -1) {
        scripts[i].parentNode.removeChild(scripts[i]);
        this.scripts[name].loaded = false;
        resolve({ script: name, loaded: false, status: 'Unloaded' });
        return;
      }
    }
    // Si no se encuentra el script cargado, se resuelve como ya descargado
    resolve({ script: name, loaded: false, status: 'Already Unloaded' });
  });
}

loadScript(name: string, forceReload = false) {
  return new Promise((resolve, reject) => {
    // Si forceReload es true, carga el script independientemente de si ya está cargado
    if (!forceReload && this.scripts[name].loaded) {
      resolve({script: name, loaded: true, status: 'Already Loaded'});
    } else {
      // Carga el script
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = this.scripts[name].src;
      if (script.readyState) {  //IE
        script.onreadystatechange = () => {
          if (script.readyState === "loaded" || script.readyState === "complete") {
            script.onreadystatechange = null;
            this.scripts[name].loaded = true;
            resolve({script: name, loaded: true, status: 'Loaded'});
          }
        };
      } else {  //Others
        script.onload = () => {
          this.scripts[name].loaded = true;
          resolve({script: name, loaded: true, status: 'Loaded'});
        };
      }
      script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  });
}

}