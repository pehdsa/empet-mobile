# Fase 7: Detalhe do Pet Report

Referencia: `docs/layout/003-pet-report-detail.md` + layouts no Pencil

## Tela: `app/pet-report/[id].tsx`

### Conteudo
- Carrossel de fotos do pet
- Informacoes basicas: nome, especie, porte, sexo, raca
- Cor primaria
- Caracteristicas (badges)
- Descricao da perda
- Mapa com localizacao do report (read-only)
- Data/hora da perda (formatada pt-BR)
- Status badge (LOST/FOUND/CANCELLED)

### Acoes (dono do report)
- Botao "Matches" → navega para matches/[reportId]
- Botao "Marcar como encontrado" → PATCH /pet-reports/{id}/found
- Botao "Cancelar report" → PATCH /pet-reports/{id}/cancel
- Confirmacao via modal antes de acoes destrutivas

### Acoes (outros usuarios)
- Botao "Reportar avistamento" → navega para sighting/new?reportId=[id]
- Lista de avistamentos (GET /pet-reports/{id}/sightings)

### API
- GET `/pet-reports/{id}` — detalhe
- GET `/pet-reports/{id}/sightings` — avistamentos

## Verificacao

- Fotos carregam no carrossel
- Informacoes completas exibidas
- Acoes do dono vs outros usuarios corretas
- Mapa mostra localizacao correta
