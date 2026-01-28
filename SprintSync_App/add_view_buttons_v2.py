import re

# Read the file
file_path = r'c:\Users\snakhate\Music\SprintSync_App\SprintSync_App\src\pages\ScrumPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find all lines with Download buttons for attachments
modified = False
i = 0
while i < len(lines):
    line = lines[i]
    
    # Look for Download className pattern in attachment context
    next_line = lines[i+1] if i+1 < len(lines) else ""
    if '<Download className="w-' in line and 'Download' in next_line:
        # Check if this is in an attachment context (look back a few lines)
        context = ''.join(lines[max(0, i-20):i])
        if 'attachment' in context.lower():
            # Check if View button doesn't already exist
            view_context = ''.join(lines[max(0, i-10):i])
            if '<Eye className=' not in view_context:
                # Find the Button opening tag (go backwards)
                button_start = i
                while button_start > 0 and '<Button' not in lines[button_start]:
                    button_start -= 1
                
                # Find the Button closing tag (go forwards)
                button_end = i
                depth = 0
                while button_end < len(lines):
                    if '<Button' in lines[button_end]:
                        depth += 1
                    if '</Button>' in lines[button_end]:
                        depth -= 1
                        if depth == 0:
                            break
                    button_end += 1
                
                # Extract the button code
                button_lines = lines[button_start:button_end+1]
                indent = len(button_lines[0]) - len(button_lines[0].lstrip())
                indent_str = ' ' * indent
                
                # Create View button with same indentation
                view_button = [
                    indent_str + '<Button\n',
                    indent_str + '  variant="outline"\n',
                    indent_str + '  size="sm"\n',
                    indent_str + '  onClick={(e) => {\n',
                    indent_str + '    e.stopPropagation();\n',
                    indent_str + '    if (attachment.fileUrl) {\n',
                    indent_str + '      window.open(attachment.fileUrl, "_blank");\n',
                    indent_str + '    }\n',
                    indent_str + '  }}\n',
                    indent_str + '>\n',
                    indent_str + '  <Eye className="w-3 h-3 mr-1" />\n',
                    indent_str + '  View\n',
                    indent_str + '</Button>\n',
                ]
                
                # Insert View button before Download button
                lines[button_start:button_start] = view_button
                modified = True
                i += len(view_button)  # Skip past the inserted lines
    
    i += 1

if modified:
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully added View buttons to remaining attachments in ScrumPage.tsx")
else:
    print("No additional Download buttons found to update")
