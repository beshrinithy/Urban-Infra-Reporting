import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to find className="..." style={{ ... }} and merge them
    # Because of multiline and arbitrary spaces, regex might be tricky, but we can do a targeted approach
    # We'll specifically look for style={{ background: "..." }} and style={{ width: "..." }} where the value is a static string
    
    # 1. replace style={{ background: "STATIC_STRING" }}
    def bg_replacer(match):
        pre = match.group(1)
        bg_val = match.group(2)
        # remove spaces inside the background string for tailwind arbitrary values
        bg_val_tw = bg_val.replace(' ', '_')
        return f'{pre} bg-[{bg_val_tw}]"'
        
    # Replace when className exists before style
    # Example: className="foo" style={{ background: "bar" }}
    content = re.sub(r'(className="[^"]*)"\s+style={{\s*background:\s*"([^"]+)"\s*}}', bg_replacer, content)
    
    # Example: style={{ background: "bar" }} className="foo"
    def bg_replacer_rev(match):
        bg_val = match.group(1).replace(' ', '_')
        post = match.group(2)
        return f'className="bg-[{bg_val}] {post}'
        
    content = re.sub(r'style={{\s*background:\s*"([^"]+)"\s*}}\s*className="([^"]*)"', bg_replacer_rev, content)

    # 2. replace style={{ background: "STATIC_STRING", backdropFilter: "blur(20px)" }}
    def bg_blur_replacer(match):
        pre = match.group(1)
        bg_val = match.group(2).replace(' ', '_')
        return f'{pre} bg-[{bg_val}] backdrop-blur-xl"'
        
    content = re.sub(r'(className="[^"]*)"\s+style={{\s*background:\s*"([^"]+)",\s*backdropFilter:\s*"blur\([^)]+\)"\s*}}', bg_blur_replacer, content)

    # 3. replace style={{ background: `...`, color: ... }} from page.tsx line 283
    content = content.replace(
        'style={{ background: `${s.color}22`, color: s.color }}',
        'style={{ backgroundColor: `${s.color}22`, color: s.color }}'  # Sometimes just changing background to backgroundColor fixes some linters, but let's just leave dynamic inline styles for now and focus on static ones
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

src_dir = r"c:\Users\shrin\urban-infra-reporting\frontend\src"

for root, dirs, files in os.walk(src_dir):
    for name in files:
        if name.endswith(".tsx"):
            fix_file(os.path.join(root, name))

print("Done")
