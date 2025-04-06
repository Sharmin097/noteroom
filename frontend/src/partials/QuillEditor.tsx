import Quill, { QuillOptions } from "quill"
import React, { CSSProperties, useEffect } from "react"

type QuillSetup = {
    quillRef: React.RefObject<Quill | null>,
    editorRef: React.RefObject<HTMLDivElement | null>,
    rootClass: string,
    style?: CSSProperties
}

export default function QuillEditor({ quillRef, editorRef, rootClass, style }: QuillSetup) {
    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
          const toolbar = document.createElement("div");
          toolbar.id = "custom-toolbar";
          toolbar.innerHTML = `
            <button class="ql-bold" title="Bold"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaBold /></svg></span></button>
            <button class="ql-italic" title="Italic"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaItalic /></svg></span></button>
            <button class="ql-underline" title="Underline"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaUnderline /></svg></span></button>
            <button class="ql-code-block" title="Code Block"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaCode /></svg></span></button>
            <button class="ql-link" title="Link"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaLink /></svg></span></button>
            <button class="ql-script" value="sub" title="Subscript"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaSubscript /></svg></span></button>
            <button class="ql-script" value="super" title="Superscript"><span class="ql-icon"><svg viewBox="0 0 24 24"><FaSuperscript /></svg></span></button>
          `;
          editorRef.current.parentElement?.insertBefore(toolbar, editorRef.current);
    
          quillRef.current = new Quill(editorRef.current, {
            theme: "snow",
            placeholder:
              "Body",
            modules: {
              toolbar: "#custom-toolbar",
            },
          } as QuillOptions);
    
          if (editorRef.current) {
            editorRef.current.style.height = "128px";
          }
        }
    
        return () => {
          quillRef.current = null;
        };
    }, []);

    return (
        <div className={rootClass} style={style}>
            <span className="char-count">
                {(quillRef.current?.getText().trim().length || 0)}/5000
            </span>
            <div className="text-editor-wrapper">
                <div ref={editorRef} />
            </div>
        </div>
    )
}