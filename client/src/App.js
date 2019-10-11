import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from 'react-bootstrap/ProgressBar';
import axios from 'axios';
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.state = {
      uploaded: [],
      progress: 0
    };

    this.uploadFile = this.uploadFile.bind(this);
    this.updateFilesList = this.updateFilesList.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  updateFilesList() { 
    try {
      fetch('/upload')
      .then(res => res.json())
      .then(data => this.setState({uploaded: data}))
    } catch(err) {
      console.log(err);
    }
  };

  async uploadFile(file) {
    const data = new FormData();
    data.append('file', file);
    try {
      let res = await axios.post('/upload', data, {
        onUploadProgress: e => this.setProgress(e.loaded / e.total * 100)
      })

      if (res.status === 200) {
        this.setProgress(100);
        console.log("getting files")
        this.updateFilesList();
        setTimeout(() => this.setProgress(0), 500);
      } else {
        console.log("not ok")
      }

    } catch(err) {
      console.log(err);
    } 
  }

  setProgress(progress) {
    this.setState({progress: progress});
  }

  handleUpload(event) {
   this.uploadFile(event.target.files[0]);
  };

  handleDownload(file) {
    window.open(`/download/${file}`);
  }

  async handleDelete(file) {
    try {
      let res = await axios.delete(`/upload/${file}`);
      if (res.status === 204) {
        this.updateFilesList();
      } else {
        console.log('no')
      }
    } catch(err) {
      console.log(err);
    } 
  };

  componentDidMount() {
    this.updateFilesList();
  };

  render() {
    let progressView = (this.state.progress > 0) 
      ? (<ProgressBar variant="success" now={this.state.progress} />)
      : "";
    return (
      <div className='container'>
       
        <input style={{ margin: '1em .3em'}} type="file" onChange={this.handleUpload}></input> 
        <div className='progressbar'>
          {progressView}
        </div>
        
        {this.state.uploaded.map((item, index) =>

          <Card key={index} style={{ margin: '.3em', padding: '.3em' }}>

            <Card.Text>{item}</Card.Text>

            <div className='buttons mr-auto'>
              <Button variant='light' className='mx-1' onClick={() => this.handleDownload(item)}>
                <FontAwesomeIcon icon={faDownload}/>
              </Button>
              <Button variant='light' className='mx-1' onClick={() => this.handleDelete(item)}>
                <FontAwesomeIcon icon={faTrashAlt}/>
              </Button>
            </div>

          </Card>)}
    
      </div>
    );
  }; 
};

export default App;
