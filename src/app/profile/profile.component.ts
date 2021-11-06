import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubSink } from 'subsink';
import { ProfileService } from '../profile.service';

export interface Profile {
  id: number
  userCode: string
  username: string
  fatherName: string
  motherName: string
  imagePath: string
}


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  subs = new SubSink(); 
  listProfile: Profile[] = []; 
  profileForm!: FormGroup;
  selectedFile: any = null;

  constructor(private profileService: ProfileService, private formBuilder: FormBuilder) { }


  ngOnInit(): void {

    this.profileForm = this.formBuilder.group({
      id: 0,
      userCode: [''],
      username: [''],
      fatherName: [''],
      motherName: [''],
      imagePath: ['']
    })

    this.subs.add(this.profileService.getAllProfiles().subscribe( (res) => {
      this.listProfile = res;
      console.log(res);
    },
    (err) => {
      console.log(err);
    }))

  }

  public saveImage(event: any): void {
    console.log(event);
    this.selectedFile = event;
    this.profileForm.get('imagePath')?.setValue(this.selectedFile.target.files[0].name);    
  }

  public saveProfile(): void {
    const file: File = this.selectedFile.target.files[0];
    const usercode = this.profileForm.get("userCode")?.value;

    this.subs.add(this.profileService.saveImage(file, usercode).subscribe((res) => {
      console.log('image uploaded...');
    },
    (err) => {
      console.log(err);
    }))

    var str = new String(this.profileForm.get('imagePath')?.value);
    var index = str.lastIndexOf('.');
    // ./assets/images/tuhin123.jpg
    str = './assets/images/' + this.profileForm.get('userCode')?.value + str.substring(index, str.length);
    this.profileForm.get('imagePath')?.setValue(str);
    //Null the selectedFile for safty (may needed while updating)
    this.selectedFile = null;

    this.subs.add(this.profileService.saveUserProfile(this.profileForm.value).subscribe( (res) => {
      alert("data saved successfully");
      this.profileForm.reset();
    },
    (err) => {
      console.log(err);
    }))
  }

  deleteProfile(id: number): void {
    this.subs.add(this.profileService.deleteprofile(id).subscribe((res) => {
      alert("profile deleted");
    },
    (err) => {
      console.log("problem in deleting profile...");
    }))
  }

  public editProfile(profile: Profile): void {
    this.profileForm.patchValue(profile);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
