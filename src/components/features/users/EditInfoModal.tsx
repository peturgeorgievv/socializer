import React, { Component } from 'react';
import firebase from '../../../config/firebaseService';
import { toastr } from 'react-redux-toastr';
import { UserData } from '../../../models/users/UserData';
import { COLLECTION } from '../../../constants/firebase-collections.constants';

type EditInfoModalProps = {
  userData: UserData;
  handleClose: any;
  show: boolean;
}

type EditInfoModalState = {
  image: any;
  localImage: any;
  url: string;
  description: string;
  firstName: string;
  lastName: string;
}

class EditInfoModal extends Component<EditInfoModalProps, EditInfoModalState> {
  state: any = {
    image: null,
    localImage: null,
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
      } as any);
    }
  }


  handleUpload = () => {
    const { image } = this.state;
    const uploadTask = firebase.storage().ref(`images/${image.name}`).put(image);
    uploadTask.on(
      "state_changed",
      () => { },
      (error: any) => {
        toastr.error('Error', error);
      },
      () => {
        firebase
          .storage()
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then((url: any) => {
            firebase.firestore().collection(COLLECTION.users).doc(this.props.userData.documentId).set({
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
      firebase.firestore().collection(COLLECTION.users).doc(this.props.userData.documentId).set({
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
          <div className="edin-info-wrap" >
            <div className="edit-info-html">
              <label htmlFor="edit-info" className="tab">
                User Info
            </label>
              <form className="edit-profile-form" onSubmit={this.handleSubmit}>
                <div className="image-holder-edit">
                  <input type="file" name="file" onChange={this.handleChange} />
                  <img
                    src={
                      this.state.localImage || 
                      this.props.userData.profilePhotoUrl || 
                      "https://www.esportschampionships.tv/wp-content/uploads/2019/09/341-3415688_no-avatar-png-transparent-png.jpg"
                    }
                    alt={this.state.name}
                  />
                </div>
                <div>
                  <div className="group">
                    <label className="label" htmlFor="title">First Name</label>
                    <input
                      name="firstName"
                      type="text"
                      className="input"
                      onChange={this.handleChange}
                      value={this.state.firstName}
                    />
                  </div>
                  <div className="group">
                    <label className="label" htmlFor="title">Last Name</label>
                    <input
                      name="lastName"
                      type="text"
                      className="input"
                      onChange={this.handleChange}
                      value={this.state.lastName}
                    />
                  </div>
                  <div className="group">
                    <label className="label" htmlFor="description">Description</label>
                    <textarea
                      name="description"
                      className="input"
                      onChange={this.handleChange}
                      value={this.state.description}
                      rows={3}
                      cols={50}>
                    </textarea>
                  </div>
                  <div className="group">
                    <input type="submit" className="button" value="Update" />
                  </div>
                </div>
              </form>
            </div>
          </div>
          <button className="close-modal" onClick={this.props.handleClose}>
            <span className="close-modal-icon"></span>
          </button>
        </section>
      </div>
    );
  }
}

export default EditInfoModal;