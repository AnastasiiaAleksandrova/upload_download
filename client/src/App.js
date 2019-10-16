import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './App.css';

const uuidv4 = require('uuid/v4');

const FAILED_TO_FETCH_FILE_LIST = 0;

class App extends Component {

  constructor() {
    super();
    this.state = {
      uploading: new Map(),
      files: [],
      errors: new Map(),
      
    };
    this.updateFilesList = this.updateFilesList.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  async uploadFile(file) {
    const data = new FormData();
    data.append('file', file);

    const id = uuidv4();

    try {
      this.createUploadProgress(id, file.name);

      let res = await axios.post(`/file/${id}`, data, {
        onUploadProgress: e => {
          let progress = e.loaded / e.total * 100;
          this.updateUploadProgress(id, progress);
        }
      });

      if (res.status === 200) {
        this.updateUploadProgress(id, 100);
        setTimeout(() => {
          this.deleteUploadProgress(id);
          this.updateFilesList();
        }, 500);
      } else {
        this.showError(id, `Failed to upload file (${res.status})`);
      }
    } catch(err) {
      this.showError(id, `Failed to upload file (${err})`);
    }
  }

  async getFileList() {
    let res = await fetch('/files');
    if (res.status == 200) {
      return res.json();
    }

    throw Error(`Failed to fetch file list (${res.status})`);
  }

  async updateFilesList() {
    try {
        let fileList = await this.getFileList();
        fileList.sort((i0, i1) => i1.tstamp - i0.tstamp);
        this.setState({files: fileList});
    } catch (err) {
      this.showFailedToFetchFileListError(err.toString());
    }
  }

  createUploadProgress(id, name) {
    let uploading = new Map(this.state.uploading);
    uploading.set(id, {id: id, name: name, progress: 0});
    this.setState({uploading: uploading});
  }  

  updateUploadProgress(id, progress) {
    let item = this.state.uploading.get(id);
    item.progress = progress;

    let uploading = new Map(this.state.uploading);
    uploading.set(id, item);
    this.setState({uploading: uploading});
  }

  deleteUploadProgress(id) {
    let uploading = new Map(this.state.uploading);
    uploading.delete(id);
    this.setState({uploading: uploading});
  }

  showError(id, err) {
    let errors = new Map(this.state.errors);
    errors.set(id, err);
    this.setState({errors: errors});
  }

  clearError(id) {
    let errors = new Map(this.state.errors);
    errors.delete(id);
    this.setState({errors: errors});
  }

  downloadFile(id) {
    window.open(`/file/${id}`);
  }

  showFailedToFetchFileListError(error) {
    this.showError(FAILED_TO_FETCH_FILE_LIST, error);
  }

  async deleteFile(id) {
    try {
      let res = await axios.delete(`/file/${id}`);
      console.log(res.status)
      if (res.status === 200) {
        this.updateFilesList();
      } else {
        this.showError(id, `Failed to delete: ${res.status}`);
      }
    } catch (err) {
      this.showError(id, `Failed to delete: ${err}`);
    }
  }

  componentDidMount() {
    this.updateFilesList();
  }

  render() {
    return (
      <div className='container'>
       
        <input type='file' style={{margin: '1em 0'}}
          onChange={e => {
            this.uploadFile(e.target.files[0]);
            e.target.value = null;
          }}/> 

        {Array.from(this.state.uploading.values()).map(item => this.renderUploadItem(item))}

        {this.renderFileList()}
      </div>
    );
  }

  renderFileList() {
    let error = this.state.errors.get(FAILED_TO_FETCH_FILE_LIST);
    if (typeof error === 'undefined') {
      return this.state.files.sort().map(item => this.renderFileItem(item));
    } else {
      return (
        <Alert variant='danger'>
          Failed to fetch uploaded files
        </Alert>

      )
    }
  }

  renderUploadItem(item) {
    let error = this.state.errors.get(item.id);
    if (typeof error === 'undefined') {
      return (
        <Card key={item.id} style={{ margin: '.3em 0', padding: '.3em' }}>
  
          <Card.Text>{item.name}</Card.Text>
  
          <div>
            <ProgressBar variant='success' now={item.progress} />
          </div>
      </Card>);
    } else {
      return this.renderErrorItem(item, 'Failed to upload', () => this.deleteUploadProgress(item.id));
    }
  }

  renderErrorItem(item, error, handler) {
    return (
      <Card key={item.id} style={{ margin: '.3em 0', padding: '.3em' }}>

        <Card.Text>{item.name}</Card.Text>

        
        <Alert variant='danger' onClose={() => handler(item.id)} dismissible>
          {error}
        </Alert>
        


    </Card>);
  }

  renderFileItem(item) {
    let error = this.state.errors.get(item.id);
    if (typeof error === 'undefined') {
      return (
        <Card key={item.id} style={{ margin: '.3em 0', padding: '.3em' }}>
  
          <Card.Text>{item.name}</Card.Text>
  
          <div className='buttons mr-auto'>
            <Button variant='light' className='mx-1' onClick={() => this.downloadFile(item.id)}>
              <FontAwesomeIcon icon={faDownload}/>
            </Button>
            <Button variant='light' className='mx-1' onClick={() => this.deleteFile(item.id)}>
              <FontAwesomeIcon icon={faTrashAlt}/>
            </Button>
          </div>
      </Card>);
    } else {
      return this.renderErrorItem(item, 'Failed to delete', () => this.clearError(item.id));
    }
  }
}

export default App;
