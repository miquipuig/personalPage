# personalPage — Next steps

> Pendents identificats per al desenvolupador. Ordena per prioritat.
> Tatxa o esborra els punts un cop tancats. Aquest fitxer és editable
> des de la pàgina Repos de loboCommand (chip "next steps").

## Audit 2026-06-15

> Auditoria contra el contracte de normalització de loboCommand. Aquest
> repo és **purament un client Angular** (sense backend, Dockerfile, GHA
> ni `.env`); el seu `package.json` script `install` fa build i copia el
> `dist/` a `../personalServer/src/public`. La unitat desplegable real és
> `personalServer`, no aquest repo. Per tant, la majoria del contracte
> (§2–§8) s'ha d'aplicar al repo `personalServer`, no aquí.

### P0 — bloquejants
- [P0] Decidir patró: fusionar `personalPage` com a `client/` dins el mono-repo `personalServer` (recomanat per §1), o documentar-ho com a sub-component i declarar explícitament que aquest repo **no es desplega per separat** (afegir nota a `README.md`).
- [P0] Renombrar/eliminar el script `install` de `package.json:7` — sobreescriu el comportament estàndard de `npm install` (build + `ncp` a sibling repo). Moure'l a `build:deploy` o equivalent perquè `npm ci` no dispari builds inesperades a CI/loboCommand.
- [P0] Bumpar `package.json:3` `"version": "0.0.0"` a semver real (ex. `0.1.0`) i adoptar `npm version patch|minor|major` per a futures releases (§1).
- [P0] Afegir `.env`, `.env.local`, `.env.*` a `.gitignore` (al bloc "Node" cap a línia 11) — defensiu encara que ara no hi hagi `.env`, evita filtracions futures (§3.0, §9).

### P1 — properes setmanes
- [P1] Si s'opta per mantenir repo separat: crear `Dockerfile` multi-stage que faci `ng build` i exposi els estàtics darrere d'un nginx alpine amb `HEALTHCHECK` a `/health/live` (§2), o eliminar-lo si el client s'incrusta al `personalServer`.
- [P1] Si s'opta per mantenir repo separat: crear `.github/workflows/docker-publish.yml` (push a `main` + `workflow_dispatch`, tags `latest` / `v<version>` / `sha-<short>` a `ghcr.io/miquipuig/personalpage`) (§2).
- [P1] Crear `.env.example` a l'arrel amb les claus que necessiti el client (ex. endpoints d'API, OAuth client IDs) i refactoritzar `src/environments/*` perquè les llegeixi en build-time si cal (§3.5).
- [P1] Substituir `proxy.conf.json:3-15` per una llista més clara amb tots els endpoints `/api/*` agrupats o usar wildcard `"/api/**"` per evitar mantenir entrades una a una.
- [P1] Reescriure `README.md` perquè descrigui aquesta relació amb `personalServer` (qui consumeix el `dist/`, com es build-and-deploy), enlloc del boilerplate genèric d'Angular CLI.

### P2 — quan hi hagi bandwidth
- [P2] Actualitzar dependències Angular: `@angular/cli ^18` (devDep `package.json:39`) conviu amb `@angular/core ^17.3.11` — alinear majors per evitar drift.
- [P2] Alinear `@angular-devkit/build-angular ^16.1.6` (`package.json:38`) amb Angular 17 o 18 segons decisió anterior.
- [P2] Considerar afegir `docker-compose.preview.yml` + `Dockerfile.dev` si es vol preview independent del `personalServer` (§5, patró A).
- [P2] Configurar pre-commit hook `gitleaks` (§9) un cop hi hagi `.env` o secrets potencials al repo.
- [P2] Afegir `eslint` / `prettier` config si encara no n'hi ha — no és al contracte però facilita auditories futures.

## P0 — bloquejants
- [ ] _Afegeix-hi els bloquejants reals…_

## P1 — properes setmanes
- [ ] 

## P2 — quan hi hagi bandwidth
- [ ] 

## Notes
