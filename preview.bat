@echo off
REM Inicia um servidor local e abre o site no navegador.
REM Necessario porque o site usa URLs limpas (ex: /sobre/) que so funcionam
REM servidas por HTTP - abrir os arquivos direto (duplo-clique) nao funciona,
REM pois o navegador nao carrega index.html automaticamente dentro de pastas
REM quando acessado via file:///.
cd /d "%~dp0"
start "" http://localhost:8080/
python -m http.server 8080
