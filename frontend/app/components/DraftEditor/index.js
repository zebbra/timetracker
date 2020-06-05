/**
*
* DraftEditor
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import EditorWrapper from './Wrapper';


class DraftEditor extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
    };

    this.handleEditorStateChange = this.handleEditorStateChange.bind(this);
  }

  componentWillMount() {
    const contentBlock = htmlToDraft(this.props.value);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      this.state = {
        editorState,
      };
    }
  }

  handleEditorStateChange(editorState) {
    // pass the editorState to the parent if the onChange function is defined
    if (this.props.onChange && typeof this.props.onChange === 'function') {
      if (this.props.raw) {
        this.props.onChange(editorState);
      } else {
        this.props.onChange(draftToHtml(convertToRaw(editorState.getCurrentContent())));
      }
    }

    this.setState({
      editorState,
    });
  }

  render() {
    return (
      <EditorWrapper>
        <Editor
          editorState={this.state.editorState}
          editorClassName="rdw-editor"
          toolbar={{
            options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'history'],
            inline: {
              inDropdown: true,
              options: ['bold', 'italic', 'underline'],
            },
            list: { inDropdown: true },
            textAlign: { inDropdown: true },
          }}
          onEditorStateChange={this.handleEditorStateChange}
        />
      </EditorWrapper>
    );
  }
}

DraftEditor.propTypes = {
  // properties
  value: PropTypes.string.isRequired,
  raw: PropTypes.bool.isRequired,
  // functions
  onChange: PropTypes.func,
};

DraftEditor.defaultProps = {
  value: '',
  raw: true,
};

export default DraftEditor;
