import React, { Component } from 'react';
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr';
import firebase from '../../../config/firebaseService';

// To fix issues with event strict typing
type CreatePostState = {
  image: string | null;
  title: string;
  description: string;
  url: string;
  status: string;
}

type CreatePostProps = {
  currentUser: any;
}

class CreatePost extends Component<CreatePostProps, any> {
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
      () => { },
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
              title: this.state.title,
              description: this.state.description,
            }).then((postData: any) => {
              firebase.firestore().collection('posts').doc(postData.id).set({ postId: postData.id }, { merge: true });
            });
            toastr.info('Created post with title', this.state.title);
            this.setState({
              url,
              image: null,
              title: '',
              description: '',
            });
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
      <div className="login-wrap" >
        <div className="login-html">
          <label htmlFor="create-post" className="tab">
            Create Post
            </label>
          <form className="login-form" onSubmit={this.handleSubmit}>
            <input type="file" onChange={this.handleChange} />
            <img
              src={this.state.url || "https://via.placeholder.com/300x300"}
              alt={this.state.name}
              height="300"
              width="300"
            />
            <div className="sign-in-htm">
              <div className="group">
                <label className="label" htmlFor="title">Title</label>
                <input
                  name="title"
                  type="text"
                  className="input"
                  onChange={this.handleChange}
                  value={this.state.title}
                />
              </div>
              <div className="group">
                <label className="label" htmlFor="description">Description</label>
                <textarea
                  name="description"
                  className="input"
                  onChange={this.handleChange}
                  value={this.state.description}
                  rows={4}
                  cols={50}>
                </textarea>
              </div>
              <div className="group">
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
                <label htmlFor="private">
                  <input
                    name="status"
                    type="radio"
                    checked={this.state.status === 'private'}
                    onChange={this.handleChange}
                    value="private" />
                  Private
                </label>
              </div>
              <div className="group">
                <input type="submit" className="button" value="Create" />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ currentUser }: any) => {
  return { currentUser };
}

export default connect(mapStateToProps)(CreatePost);