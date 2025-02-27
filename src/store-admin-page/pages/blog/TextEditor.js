import React, { Component } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"; // Import default styles
import { storage, ref, uploadBytes, getDownloadURL } from "../../../refrence/storeConfig"; // Firebase Storage

class TextEditor extends Component {
  state = {
    editorState: this.props.editorState || EditorState.createEmpty(),
  };

  // Handle editor state change
  onEditorStateChange = (editorState) => {
    this.setState({ editorState });
    this.props.setEditorState(editorState); // Pass new state to parent
  };

  // Firebase-д зураг хадгалах функц
  uploadImageCallback = async (file) => {
    return new Promise(async (resolve, reject) => {
      if (!file) return reject("Файл сонгогдоогүй");

      const storageRef = ref(storage, `images/${file.name}`);
      try {
        // Firebase-д upload хийх
        await uploadBytes(storageRef, file);
        // URL авах
        const url = await getDownloadURL(storageRef);

        resolve({ data: { link: url } });
      } catch (error) {
        console.error("Зургийг хадгалахад алдаа гарлаа:", error);
        reject(error);
      }
    });
  };

  render() {
    const { editorState } = this.state;

    return (
      <div style={styles.editorContainer}>
        <Editor
          editorState={editorState}
          toolbarClassName="toolbarClassName"
          wrapperClassName="wrapperClassName"
          editorClassName="editorClassName"
          onEditorStateChange={this.onEditorStateChange}
          placeholder="Start typing here..."
          toolbar={{
            options: ["fontSize", "inline", "blockType", "list", "textAlign", "image"],
            fontSize: { options: [8, 10, 12, 14, 16, 18, 24, 30, 48, 60, 72] },
            image: {
              uploadCallback: this.uploadImageCallback,
              inputAccept: "image/gif,image/jpeg,image/jpg,image/png,image/svg",
              alt: { present: false, mandatory: false },
              previewImage: true,
            },
          }}
        />
      </div>
    );
  }
}

// Styles
const styles = {
  editorContainer: {
    border: "2px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    maxWidth: "800px",
    margin: "auto",
  },
  editorClassName: {
    padding: "15px",
    fontFamily: "'Arial', sans-serif",
    fontSize: "16px",
    color: "#333",
    minHeight: "150px",
  },
};

export default TextEditor;
