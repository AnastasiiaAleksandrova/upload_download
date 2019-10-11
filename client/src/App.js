import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.state = {
      uploaded: []
    };

    this.uploadFile = this.uploadFile.bind(this);
    this.updateFilesList = this.updateFilesList.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
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
      let res = await fetch('/upload', {
        body: data,
        method: "post"
      })
      
      if (res.status === 200) {
        console.log("getting files")
        this.updateFilesList();
      } else {
        console.log("not ok")
      }
    } catch(err) {
      console.log(err);
    } 
  };

  handleUpload(event) {
   this.uploadFile(event.target.files[0]);
   //this.updateFilesList();
  };

  handleDownload(file) {
    window.open(`/download/${file}`);
    //fetch(`/download/${file}`)
  }

  componentDidMount() {
    this.updateFilesList();
  };

  render() {
    return (
      <div className="container">
        <input style={{ margin: '1em .3em'}} type="file" onChange={this.handleUpload}></input>     
        
        {this.state.uploaded.map((item, index) =>
          <Card key={index} style={{ margin: '.3em', padding: '.3em' }}>
            <Card.Text>{item}</Card.Text>
            <Button style={{width: '1em'}} onClick={() => this.handleDownload(item)}></Button>
            {/* <Button style={{width: '1em'}} onClick={() => this.handleDownload()}></Button> */}
          </Card>)}
    
      </div>
    );
  }; 
};

export default App;
