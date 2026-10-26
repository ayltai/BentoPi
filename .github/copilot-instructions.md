## Guidelines

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask for clarification.
- If multiple interpretations exist, present them. Don't pick silently.
- If a simpler approach exists, present it. Don't hide complexity.
- If something is unclear, stop. Name what's confusing. Ask for clarification. Don't guess silently.

## Solution Approach

- Always start small and simple, and then iterate to improve the solution.
- Always explain your plans and reasoning before implementing any code.
- Always prioritise simplicity and efficiency in your solutions, clarity in your code, and maintainability in your implementations.
- Always ask for clarification if the problem statement is ambiguous or unclear.
- Always ask for feedback on your solution approach before implementing it.
- Always implement the solution in thin slices, and test each slice before moving on to the next one.

## Software Engineering Excellence Standards

### Design Principles

- SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- Patterns: Apply recognised design patterns where appropriate, and avoid over-engineering or unnecessary complexity.
- Clean Code: Enforce DRY, YAGNI, and KISS principles, and avoid code duplication, unnecessary abstractions, and over-engineering.
- Architecture: Maintain a clear separation of concerns, and avoid tight coupling between components. Use modular design and follow established architectural patterns where appropriate.
- Security: Implement secure-by-design principles, and avoid introducing security vulnerabilities or risks into the codebase. Follow best practices for secure coding, such as input validation and output encoding, and avoid hardcoding sensitive information or credentials in the codebase.

## Coding Styles

- Always write code in a clear, maintainable, and efficient manner, following best practices and coding standards.
- Avoid writing comments in the code unless necessary for clarity, and ensure that any comments are concise and informative.
- Avoid breaking a line of code into multiple lines unless it is necessary for readability or to adhere to coding standards. There is no line length limit.

## Project Infrastructure

### Hardware

- **Mini PC:** An always-on Intel N100 mini PC with 16 GB DDR-4 RAM and 512 GB SSD running Portainer Business Edition 2.45.x LTS.
- **ESP32-S3:** One ESP32-S3 device with a microphone and speaker used as a voice assistant.
- **ESP32-C3:** A number of ESP32-C3 devices used for various purposes, including temperature, humidity, and air quality measurement, and door sensing.
- **ESP32-CAM:** A spare device that is currently not in use.

## Project Overview
- **`esphome/config`:** Contains ESPHome configuration files.
- **`frigate/config`:** Contains Frigate configuration files.
- **`homeassistant/config`:** Contains Home Assistant configuration files.

