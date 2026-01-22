import sys

with open('assets/main.css', 'r') as f:
    lines = f.readlines()

# Search for the start of the first messy block
start_index = -1
for i, line in enumerate(lines):
    if '.qty-selector {' in line and i > 1750:
        start_index = i
        break

# Search for the end of the messy block (before Camping Options)
end_index = -1
for i, line in enumerate(lines):
    if '/* Camping Options */' in line:
        end_index = i
        break

if start_index != -1 and end_index != -1:
    new_css = [
        ".qty-selector {\n",
        "  display: flex !important;\n",
        "  align-items: center !important;\n",
        "  justify-content: center !important;\n",
        "  gap: 8px !important;\n",
        "  width: fit-content !important;\n",
        "}\n\n",
        ".qty-btn {\n",
        "  display: flex !important;\n",
        "  align-items: center !important;\n",
        "  justify-content: center !important;\n",
        "  width: 36px !important;\n",
        "  height: 36px !important;\n",
        "  background: #222 !important;\n",
        "  border: 1px solid var(--color-border) !important;\n",
        "  border-radius: 4px !important;\n",
        "  color: #fff !important;\n",
        "  font-size: 1.25rem !important;\n",
        "  padding: 0 !important;\n",
        "  cursor: pointer !important;\n",
        "}\n\n",
        ".qty-selector input {\n",
        "  width: 44px !important;\n",
        "  height: 36px !important;\n",
        "  background: #000 !important;\n",
        "  border: 1px solid var(--color-accent) !important;\n",
        "  border-radius: 4px !important;\n",
        "  color: #fff !important;\n",
        "  font-size: 1.1rem !important;\n",
        "  font-weight: 700 !important;\n",
        "  text-align: center !important;\n",
        "  opacity: 1 !important;\n",
        "  -webkit-text-fill-color: #fff !important;\n",
        "  pointer-events: none !important;\n",
        "}\n\n",
        ".addon-qty-controls {\n",
        "  display: flex !important;\n",
        "  align-items: center !important;\n",
        "  gap: 12px !important;\n",
        "  margin-top: 12px !important;\n",
        "  padding: 8px !important;\n",
        "  background: rgba(255,255,255,0.03) !important;\n",
        "  border-radius: 8px !important;\n",
        "  border: 1px solid var(--color-border) !important;\n",
        "  width: fit-content !important;\n",
        "}\n\n"
    ]
    # Keep the label style if needed
    new_css.append(".addon-qty-controls label { font-size: 0.875rem; color: #a0a0a8; margin: 0; }\n\n")
    
    lines[start_index:end_index] = new_css
    with open('assets/main.css', 'w') as f:
        f.writelines(lines)
    print("CSS Fixed")
else:
    print(f"Indices not found: {start_index}, {end_index}")
