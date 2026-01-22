import sys

with open('assets/main.css', 'r') as f:
    lines = f.readlines()

start_index = -1
for i, line in enumerate(lines):
    if '.qty-selector {' in line and i > 1700:
        start_index = i
        break

end_index = -1
for i, line in enumerate(lines):
    if '/* Camping Options */' in line:
        end_index = i
        break

if start_index != -1 and end_index != -1:
    new_css = [
        "/* --- Premium Quantity Selectors --- */\n",
        ".addon-qty-controls {\n",
        "  display: flex;\n",
        "  align-items: center;\n",
        "  justify-content: space-between;\n",
        "  margin-top: 1rem;\n",
        "  padding: 0.75rem 1rem;\n",
        "  background: rgba(255, 255, 255, 0.03);\n",
        "  border: 1px solid rgba(255, 255, 255, 0.1);\n",
        "  border-radius: 12px;\n",
        "  transition: all 0.3s ease;\n",
        "}\n\n",
        ".addon-qty-controls label {\n",
        "  font-size: 0.85rem;\n",
        "  font-weight: 600;\n",
        "  color: var(--color-text-muted);\n",
        "  text-transform: uppercase;\n",
        "  letter-spacing: 0.05em;\n",
        "}\n\n",
        ".qty-selector {\n",
        "  display: flex;\n",
        "  align-items: center;\n",
        "  gap: 12px;\n",
        "}\n\n",
        ".qty-btn {\n",
        "  width: 32px;\n",
        "  height: 32px;\n",
        "  display: flex;\n",
        "  align-items: center;\n",
        "  justify-content: center;\n",
        "  background: rgba(255, 255, 255, 0.05);\n",
        "  border: 1px solid var(--color-border);\n",
        "  border-radius: 8px;\n",
        "  color: #fff;\n",
        "  font-size: 1.2rem;\n",
        "  font-weight: bold;\n",
        "  cursor: pointer;\n",
        "  transition: all 0.2s ease;\n",
        "  user-select: none;\n",
        "}\n\n",
        ".qty-btn:hover {\n",
        "  background: var(--color-accent);\n",
        "  color: #000;\n",
        "  border-color: var(--color-accent);\n",
        "  transform: scale(1.1);\n",
        "}\n\n",
        ".qty-selector input {\n",
        "  width: 40px;\n",
        "  height: 32px;\n",
        "  background: transparent !important;\n",
        "  border: none !important;\n",
        "  color: #fff !important;\n",
        "  font-size: 1.1rem !important;\n",
        "  font-weight: 800 !important;\n",
        "  text-align: center !important;\n",
        "  opacity: 1 !important;\n",
        "  -webkit-text-fill-color: #fff !important;\n",
        "  pointer-events: none;\n",
        "}\n\n"
    ]
    lines[start_index:end_index] = new_css
    with open('assets/main.css', 'w') as f:
        f.writelines(lines)
    print("Stylized CSS Applied")
else:
    print(f"Indices not found")
