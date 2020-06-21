import React, { Component } from 'react';
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr';
import firebase from '../../../config/firebaseService';
import { POST_TYPE } from '../../../constants/post-type.constants';
import { COLLECTION } from '../../../constants/firebase-collections.constants';

type CreatePostState = {
  name: string;
  image: any;
  title: string;
  localImage: any;
  description: string;
  url: string;
  status: string;
}

type CreatePostProps = {
  currentUser: any;
}

class CreatePost extends Component<CreatePostProps, CreatePostState> {
  constructor(props: CreatePostProps) {
    super(props);
    this.state = {
      name: '',
      image: null,
      localImage: null,
      title: '',
      description: '',
      url: '',
      status: POST_TYPE.public,
    };
  }

  handleChange = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.setState({
          image,
          localImage: e.target.result
        });
      };
      reader.readAsDataURL(event.target.files[0]);
    } else {
      const { name, value } = event.target
      this.setState({
        [name]: value,
      } as any);
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
        toastr.error('Oops, something went wrong', '');
      },
      () => {
        firebase
          .storage()
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then((url: any) => {
            firebase.firestore().collection(COLLECTION.posts).add({
              imgUrl: url,
              status: this.state.status,
              dateCreated: new Date().toLocaleString(),
              uploadedBy: this.props.currentUser.documentId,
              title: this.state.title,
              description: this.state.description,
            }).then((postData: any) => {
              firebase.firestore().collection(COLLECTION.posts).doc(postData.id).set({ postId: postData.id }, { merge: true });
            });
            toastr.info('Created post with title', this.state.title);
            this.setState({
              image: null,
              localImage: null,
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
    event.target.file.value = '';
  }

  render = () => {
    return (
      <div className="create-post-wrap" >
        <div className="create-post-html">
          <label htmlFor="create-post" className="tab">
            Create Post
            </label>
          <form className="create-post-form" onSubmit={this.handleSubmit}>
            <div className="image-holder">
              <input type="file" name="file" onChange={this.handleChange} />
              <img
                src={this.state.localImage || "https://via.placeholder.com/300x300"}
                alt={this.state.name}
              />
            </div>
            <div>
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
                    checked={this.state.status === POST_TYPE.public}
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
                    checked={this.state.status === POST_TYPE.private}
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