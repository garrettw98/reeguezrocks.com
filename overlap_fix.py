import sys

with open('assets/main.css', 'r') as f:
    lines = f.readlines()

start_index = -1
for i, line in enumerate(lines):
    if '/* --- Premium Quantity Selectors --- */' in line:
        start_index = i
        break

end_index = -1
for i, line in enumerate(lines):
    if '/* Camping Options */' in line:
        end_index = i
        break

if start_index != -1 and end_index != -1:
    new_css = [
        "/* --- Premium Quantity Selectors (Fixed) --- */\n",
        ".addon-qty-controls {\n",
        "  display: flex !important;\n",
        "  align-items: center !important;\n",
        "  justify-content: space-between !important;\n",
        "  margin-top: 1.5rem !important;\n",
        "  padding: 1rem !important;\n",
        "  background: rgba(255, 255, 255, 0.05) !important;\n",
        "  border: 1px solid rgba(255, 255, 255, 0.1) !important;\n",
        "  border-radius: 12px !important;\n",
        "  width: 100% !important;\n",
        "  max-width: 320px !important;\n",
        "}\n\n",
        ".addon-qty-controls label {\n",
        "  font-size: 0.8rem !important;\n",
        "  font-weight: 700 !important;\n",
        "  color: #a0a0a8 !important;\n",
        "  text-transform: uppercase !important;\n",
        "  margin: 0 !important;\n",
        "}\n\n",
        ".qty-selector {\n",
        "  display: flex !important;\n",
        "  align-items: center !important;\n",
        "  gap: 0 !important;\n",
        "  border: 1px solid rgba(255, 255, 255, 0.2) !important;\n",
        "  border-radius: 8px !important;\n",
        "  overflow: hidden !important;\n",
        "}\n\n",
        ".qty-btn {\n",
        "  width: 40px !important;\n",
        "  height: 40px !important;\n",
        "  display: flex !important;\n",
        "  align-items: center !important;\n",
        "  justify-content: center !important;\n",
        "  background: #222 !important;\n",
        "  border: none !important;\n",
        "  color: #fff !important;\n",
        "  font-size: 1.25rem !important;\n",
        "  cursor: pointer !important;\n",
        "}\n\n",
        ".qty-btn:hover { background: var(--color-accent) !important; color: #000 !important; }\n\n",
        ".qty-selector input {\n",
        "  width: 50px !important;\n",
        "  height: 40px !important;\n",
        "  background: #000 !important;\n",
        "  border-left: 1px solid rgba(255, 255, 255, 0.1) !important;\n",
        "  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;\n",
        "  border-top: none !important;\n",
        "  border-bottom: none !important;\n",
        "  color: #fff !important;\n",
        "  font-size: 1.1rem !important;\n",
        "  font-weight: 800 !important;\n",
        "  text-align: center !important;\n",
        "  -webkit-text-fill-color: #fff !important;\n",
        "  opacity: 1 !important;\n",
        "  margin: 0 !important;\n",
        "  padding: 0 !important;\n",
        "  pointer-events: none !important;\n",
        "}\n\n"
    ]
    lines[start_index:end_index] = new_css
    with open('assets/main.css', 'w') as f:
        f.writelines(lines)
    print("Fixed Overlap CSS Applied")
else:
    print(f"Indices not found")
