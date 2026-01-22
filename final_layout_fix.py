import sys

with open('assets/main.css', 'r') as f:
    lines = f.readlines()

start_index = -1
for i, line in enumerate(lines):
    if '.addon-qty-controls {' in line and i > 1700:
        start_index = i
        break

end_index = -1
for i, line in enumerate(lines):
    if '/* Camping Options */' in line:
        end_index = i
        break

if start_index != -1 and end_index != -1:
    new_css = [
        "/* --- Final Polished Quantity Selector --- */\n",
        ".addon-qty-controls {\n",
        "  display: flex !important;\n",
        "  align-items: center !important;\n",
        "  justify-content: space-between !important;\n",
        "  margin-top: 1.25rem !important;\n",
        "  padding: 0.75rem 1rem !important;\n",
        "  background: rgba(255, 255, 255, 0.05) !important;\n",
        "  border: 1px solid rgba(255, 255, 255, 0.1) !important;\n",
        "  border-radius: 14px !important;\n",
        "  max-width: 340px !important;\n",
        "}\n\n",
        ".addon-qty-controls label {\n",
        "  font-size: 0.75rem !important;\n",
        "  font-weight: 700 !important;\n",
        "  color: #a0a0a8 !important;\n",
        "  text-transform: uppercase !important;\n",
        "  letter-spacing: 0.05em !important;\n",
        "  margin: 0 !important;\n",
        "}\n\n",
        ".qty-selector {\n",
        "  display: grid !important;\n",
        "  grid-template-columns: 36px 44px 36px !important;\n",
        "  align-items: center !important;\n",
        "  gap: 4px !important;\n",
        "}\n\n",
        ".qty-btn {\n",
        "  width: 36px !important;\n",
        "  height: 36px !important;\n",
        "  display: flex !important;\n",
        "  align-items: center !important;\n",
        "  justify-content: center !important;\n",
        "  background: #333 !important;\n",
        "  border: 1px solid rgba(255,255,255,0.1) !important;\n",
        "  border-radius: 8px !important;\n",
        "  color: #ffffff !important;\n",
        "  font-size: 1.5rem !important;\n",
        "  font-weight: 400 !important;\n",
        "  cursor: pointer !important;\n",
        "  padding: 0 !important;\n",
        "  margin: 0 !important;\n",
        "  line-height: 1 !important;\n",
        "}\n\n",
        ".qty-btn:hover {\n",
        "  background: var(--color-accent) !important;\n",
        "  color: #000 !important;\n",
        "  border-color: var(--color-accent) !important;\n",
        "}\n\n",
        ".qty-selector input {\n",
        "  width: 100% !important;\n",
        "  height: 36px !important;\n",
        "  background: transparent !important;\n",
        "  border: none !important;\n",
        "  color: #ffffff !important;\n",
        "  font-size: 1.2rem !important;\n",
        "  font-weight: 800 !important;\n",
        "  text-align: center !important;\n",
        "  margin: 0 !important;\n",
        "  padding: 0 !important;\n",
        "  -webkit-text-fill-color: #ffffff !important;\n",
        "  opacity: 1 !important;\n",
        "  pointer-events: none !important;\n",
        "}\n\n"
    ]
    lines[start_index:end_index] = new_css
    with open('assets/main.css', 'w') as f:
        f.writelines(lines)
    print("Final Polished CSS Applied")
else:
    print("Indices not found")
