import React, { Component } from 'react';
import firebase from '../../../config/firebaseService';

class EditInfoModal extends Component<any, any> {
  state: any = {
    image: null,
    url: '',
    description: this.props.userData.description,
    firstName: this.props.userData.firstName,
    lastName: this.props.userData.lastName
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
              console.log(url);
              firebase.firestore().collection('users').doc(this.props.userData.documentId).set({
                profilePhotoUrl: url,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                description: this.state.description,
              }, { merge: true });
              this.setState({ url });
            });
        }
    );
  };


  handleSubmit = (event: any) => {
    event.preventDefault();
    if (this.state.image) {
      this.handleUpload();
    } else {
      firebase.firestore().collection('users').doc(this.props.userData.documentId).set({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        description: this.state.description,
      }, { merge: true });
    }
  }
 
  render = () => {
    const showHideClassName = this.props.show ? 'modal display-block' : 'modal display-none';

    return (
      <div className={showHideClassName}>
        <section className="modal-main-edit">
          <div>
            <form className="comment-form" onSubmit={this.handleSubmit}>
              <div>
              <input type="file" onChange={this.handleChange} />
                <img 
                  className="avatar"
                  src={this.state.url || this.props.userData.profilePhotoUrl || "https://www.esportschampionships.tv/wp-content/uploads/2019/09/341-3415688_no-avatar-png-transparent-png.jpg"} 
                  alt="modal"
                />
              </div>
              <div>
                <label htmlFor="firstName">First Name</label>
                <input name="firstName" type="text" value={this.state.firstName} onChange={this.handleChange} />
              </div>
              <div>
                <label htmlFor="lastName">Last Name</label>
                <input name="lastName" type="text" value={this.state.lastName} onChange={this.handleChange} />
              </div>
              <div>
              <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  value={this.state.description}
                  onChange={this.handleChange}
                  placeholder="Enter a description"
                  rows={5}
                  cols={50}
                >
                </textarea>
              </div>
              <button type="submit">Update Info</button>
            </form>
          </div>
          <button onClick={this.props.handleClose}>close</button>
        </section>
      </div>
    );
  }
}

export default EditInfoModal;