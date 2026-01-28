import re

# Read the file
file_path = r'c:\Users\snakhate\Music\SprintSync_App\SprintSync_App\src\pages\ScrumPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find Download buttons for attachments
# This pattern looks for Download buttons that are standalone (not already in a flex container with View button)
pattern = r'(<Button\s+variant="outline"\s+size="sm"\s+onClick=\{[^}]*attachment\.fileUrl[^}]*\}[^>]*>\s*<Download className="w-[34] h-[34][^"]*"[^/]*/>\s*Download\s*</Button>)'

def replacement_func(match):
    download_button = match.group(1)
    
    # Create the View button
    view_button = '''<Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (attachment.fileUrl) {
                                    window.open(attachment.fileUrl, "_blank");
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              '''
    
    # Wrap both buttons in a flex container
    return f'<div className="flex items-center gap-2">\n                              {view_button}\n                              {download_button}\n                            </div>'

# Apply the replacement
new_content = re.sub(pattern, replacement_func, content, flags=re.DOTALL)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully added View buttons to attachments in ScrumPage.tsx")
