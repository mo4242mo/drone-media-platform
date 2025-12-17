import pdfplumber
import fitz  # PyMuPDF
import pandas as pd
import os
from pathlib import Path

def extract_academic_pdf(pdf_path, output_dir="extracted_content"):
    """
    提取学术 PDF 中的文字、表格和图片
    
    Args:
        pdf_path: PDF 文件路径
        output_dir: 输出文件夹路径
    """
    # 创建输出目录（parents=True 确保父目录也被创建）
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    Path(f"{output_dir}/images").mkdir(parents=True, exist_ok=True)
    
    # -------- 提取文字和表格 (使用 pdfplumber) --------
    text_content = ""
    tables = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            print(f"正在处理第 {page_num} 页...")
            
            # 提取文本（保留段落格式）
            page_text = page.extract_text_simple()
            if page_text:
                text_content += f"\n\n--- 第 {page_num} 页 ---\n\n{page_text}"
            
            # 提取表格
            page_tables = page.extract_tables()
            for table_idx, table in enumerate(page_tables):
                if table:
                    # 转换为 DataFrame
                    df = pd.DataFrame(table)
                    tables.append({
                        "page": page_num,
                        "table_idx": table_idx + 1,
                        "data": df
                    })
    
    # 保存文字内容
    with open(f"{output_dir}/text_content.md", "w", encoding="utf-8") as f:
        f.write("# 学术论文内容提取\n")
        f.write(f"来源文件: {os.path.basename(pdf_path)}\n")
        f.write(text_content)
    
    # 保存表格到 Excel
    if tables:
        with pd.ExcelWriter(
            f"{output_dir}/tables.xlsx",
            engine="openpyxl"
        ) as writer:
            for table in tables:
                sheet_name = f"第{table['page']}页_表{table['table_idx']}"
                table['data'].to_excel(writer, sheet_name=sheet_name, index=False)
    
    # -------- 提取图片 (使用 PyMuPDF) --------
    pdf_document = fitz.open(pdf_path)
    image_count = 0
    
    for page_num, page in enumerate(pdf_document, 1):
        images = page.get_images(full=True)
        
        for img_idx, img in enumerate(images):
            xref = img[0]
            base_image = pdf_document.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # 保存图片
            image_filename = f"page_{page_num}_img_{img_idx + 1}.{image_ext}"
            with open(f"{output_dir}/images/{image_filename}", "wb") as f:
                f.write(image_bytes)
            
            image_count += 1
    
    pdf_document.close()
    
    # 打印提取结果汇总
    print("\n" + "="*50)
    print("提取完成！")
    print(f"📄 文字内容保存在: {output_dir}/text_content.md")
    if tables:
        print(f"📊 表格保存在: {output_dir}/tables.xlsx")
    print(f"🖼️  共提取 {image_count} 张图片，保存在: {output_dir}/images/")
    print("="*50)

# ------------------- 调用函数 -------------------
if __name__ == "__main__":
    # docs 文件夹路径
    DOCS_DIR = "./docs"
    
    # 遍历 docs 文件夹中的所有 PDF 文件
    pdf_files = list(Path(DOCS_DIR).glob("*.pdf"))
    
    if not pdf_files:
        print(f"错误：在 {DOCS_DIR} 文件夹中未找到 PDF 文件")
    else:
        print(f"找到 {len(pdf_files)} 个 PDF 文件")
        for pdf_path in pdf_files:
            print(f"\n{'='*50}")
            print(f"正在处理: {pdf_path.name}")
            print("="*50)
            # 为每个 PDF 创建单独的输出目录
            output_dir = f"extracted_content/{pdf_path.stem}"
            extract_academic_pdf(str(pdf_path), output_dir)
