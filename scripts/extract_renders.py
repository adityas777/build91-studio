import fitz  # PyMuPDF
import os

MAPPING = {
    "interiors": "Build91 Interior Portfolio_watermark (1).pdf",
    "exteriors": "Build91_Exterior_Portfolio 2025 (2).pdf",
    "isometric": "isometric.pdf"
}

output_base_dir = os.path.join(os.getcwd(), "public", "images", "extracted_portfolio")
os.makedirs(output_base_dir, exist_ok=True)

for category, pdf_name in MAPPING.items():
    pdf_path = os.path.join(os.getcwd(), pdf_name)
    if not os.path.exists(pdf_path):
        print(f"Skipping: {pdf_name} does not exist at {pdf_path}")
        continue

    print(f"\nProcessing {pdf_name} for category '{category}'...")
    doc = fitz.open(pdf_path)
    category_dir = os.path.join(output_base_dir, category)
    os.makedirs(category_dir, exist_ok=True)

    extracted_count = 0
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        image_list = page.get_images(full=True)

        if not image_list:
            print(f"  Page {page_idx + 1}: No images found.")
            continue

        # Find the image with the largest byte size on this page
        largest_xref = None
        largest_size = -1
        largest_ext = ""

        for img in image_list:
            xref = img[0]
            try:
                base_image = doc.extract_image(xref)
                img_size = len(base_image["image"])
                if img_size > largest_size:
                    largest_size = img_size
                    largest_xref = xref
                    largest_ext = base_image["ext"]
            except Exception as e:
                print(f"  Error extracting image xref {xref} on page {page_idx + 1}: {e}")

        # Save the largest image if found and reasonably sized (e.g. > 15KB to avoid watermarks)
        if largest_xref is not None and largest_size > 15000:
            try:
                base_image = doc.extract_image(largest_xref)
                image_bytes = base_image["image"]
                
                # Zero-pad page index so they sort alphabetically (e.g. render_01, render_02)
                filename = f"render_{page_idx + 1:02d}.{largest_ext}"
                out_path = os.path.join(category_dir, filename)
                
                with open(out_path, "wb") as f:
                    f.write(image_bytes)
                
                extracted_count += 1
                # Log progress periodically
                if (page_idx + 1) % 5 == 0 or (page_idx + 1) == len(doc):
                    print(f"  Progress: Extracted {page_idx + 1}/{len(doc)} pages...")
            except Exception as e:
                print(f"  Failed to save image for page {page_idx + 1}: {e}")
        else:
            print(f"  Page {page_idx + 1}: Largest image is too small ({largest_size} bytes). Skipping.")

    print(f"Finished category '{category}': Extracted {extracted_count} high-res images.")

print("\nPDF extraction complete!")
