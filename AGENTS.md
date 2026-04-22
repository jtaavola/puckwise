# Agent Configuration

This file contains configuration and guidance for AI coding assistants working on this project.

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
  - task: "Routing, route definitions, navigation, and route parameters"
    load: "node_modules/@tanstack/router-core/skills/router-core/SKILL.md"
  - task: "Server functions, SSR, middleware, and deployment"
    load: "node_modules/@tanstack/start-client-core/skills/start-core/SKILL.md"
  - task: "Custom devtools panels and plugins"
    load: "node_modules/@tanstack/devtools/skills/devtools-plugin-panel/SKILL.md"
  - task: "Route generation, code splitting, and Vite plugin config"
    load: "node_modules/@tanstack/router-plugin/skills/router-plugin/SKILL.md"
  - task: "Devtools integration and configuration"
    load: "node_modules/@tanstack/devtools/skills/devtools-app-setup/SKILL.md"
<!-- intent-skills:end -->
