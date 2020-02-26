import React, { Component } from 'react';
import firebase from '../../../config/firebaseService';
import { connect } from 'react-redux'

class CreatePost extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      image: null,
      title: '',
      description: '',
      url: '',
      status: 'public',
    };
  }

  handleChange = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];
      this.setState(({ image }));
    } else {
      const { name, value } = event.target
      this.setState({
        [name]: value,
      });
    }
  };

  componentDidMount = () => {
    // this._isMounted = true;
  }

  componentWillUnmount = () => {
    // this._isMounted = false;
  }

  handleUpload = () => {
    const { image } = this.state;
    const uploadTask = firebase.storage().ref(`images/${image.name}`).put(image);
      uploadTask.on( 
        "state_changed",
        () => {},
        (error: any) => {
          console.log(error);
        },
        () => {
          firebase
            .storage()
            .ref("images")
            .child(image.name)
            .getDownloadURL()
            .then((url: any) => {
              firebase.firestore().collection('posts').add({
                imgUrl: url,
                status: this.state.status,
                dateCreated: new Date().toLocaleString(),
                uploadedBy: this.props.currentUser.documentId,
                userRef: firebase.firestore().doc(`users/${this.props.currentUser.documentId}`),
                profilePhotoUrl: this.props.currentUser.profilePhotoUrl,
                firstName: this.props.currentUser.firstName,
                lastName: this.props.currentUser.lastName,
                title: this.state.title,
                description: this.state.description,
                comments: [],
                likes: [],
              }).then((postData: any) => {
                firebase.firestore().collection('posts').doc(postData.id).set({ postId: postData.id }, { merge: true });
              });
              this.setState({ url });
            });
        }
    );
  };

  handleSubmit = (event: any) => {
    event.preventDefault();
    this.handleUpload();
  } 
  
  render = () => {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
        <input type="file" onChange={this.handleChange} />
        <img
          src={this.state.url || "https://via.placeholder.com/400x300"}
          alt={this.state.name}
          height="300"
          width="400"
        />
        <br />
        <label htmlFor="title">Title</label>
        <input name="title" type="text" onChange={this.handleChange} />
        <br />
        <label htmlFor="description">Description</label>
        <textarea name="description" onChange={this.handleChange} rows={5} cols={50}>
        </textarea>
          <br />
          <label htmlFor="public">
            <input 
              name="status"
              checked={this.state.status === 'public'} 
              onChange={this.handleChange}
              type="radio"
              value="public"
            />
            Public
          </label>
          <br />
          <label htmlFor="private">
            <input
              name="status"
              type="radio"
              checked={this.state.status === 'private'} 
              onChange={this.handleChange}
              value="private"
             />
            Private
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = ({ currentUser }: any) => {
  return { currentUser };
}

export default connect(mapStateToProps)(CreatePost);