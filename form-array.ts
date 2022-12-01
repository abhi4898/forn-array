import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FloatLabelType } from '@angular/material/form-field';
import { Router } from '@angular/router';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SavePopupComponent } from 'src/app/shared/Layout/save-popup/save-popup.component';
import { MockServiceService } from 'src/app/shared/service/mock-service.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { SdoService } from 'src/app/shared/service/sdo.service';
import { identifierName } from '@angular/compiler';
@Component({
  selector: 'app-parameter-addedit',
  templateUrl: './parameter-addedit.component.html',
  styleUrls: ['./parameter-addedit.component.css'],
})
export class ParameterAddeditComponent implements OnInit {
  editData: any;
  startDate!: string;
  muteFromDate!: string;
  muteDateSelected: any = 'true';
  startDateSelected: any = 'true';
  showPrioritiList: boolean = false;
  showPrioritiListBrand: boolean = false;
  isMute: boolean = false;
  // main drop down data mpping
  allMasterTableData!: any;
  storeDetailsList!: any;
  processTypeList!: [];
  vendorAndDirectAlertingList!: [];
  vendorAlertingList!: any;
  directAlertingList!: [];
  programList!: [];
  retailersList!: [];
  storeList!: any;
  storeClusterList!: any;
  storeStateList!: any;
  storeCityList!: any;
  storeZipCodeList!: any;
  storeGeographyBasedList: any;
  storeGeographyBasedListCopy: any;
  allStoreList!: any;
  categoryList!: [];
  brandList!: any;
  skuClusterList!: [];
  countryValues!: [];
  chronicityList!: [];
  alertTypeList!: [];
  constructor(
    public mockService: MockServiceService,
    private router: Router,
    public dialog: MatDialog,
    private popupService: PopupService,
    private sdoService: SdoService,
    private fb: FormBuilder
  ) {}
  addAlertConfigForm!: FormGroup;
  ngOnInit(): void {
    this.mockService.currentApprovalStageMessage.subscribe((data) => {
      this.editData = data;
    });
    this.sdoService.getAllMasterTableData().subscribe((data) => {
      this.allMasterTableData = data;
      this.retailersList = data.retailers;
      this.processTypeList = data.vendor_type;
      this.chronicityList = data.chronicity;
      this.alertTypeList = data.alert_type;
      this.countryValues = data.country;
      // this.storeStateList = data.states;
    });
    this.addAlertFormInitialize(null);
    this.sdoService.getEditData('Test').subscribe((data: any) => {
      this.editData = data;
      this.addAlertFormInitialize(data);
      this.populateDataBasedOnRetailer();
      this.onProcessTypeChange('');
      if (data.alertConfigData[0].vendor_type_id == 1) {
        this.addControls(
          'processType',
          'vendorAlertingId',
          data.alertConfigData[0].vendor_id
        );
        this.onVendorAlertingChange('');
      }
      if (data.alertConfigData[0].vendor_type_id == 2) {
        this.onVendorDirectChange('');
        this.addControls(
          'processType',
          'directAlertingId',
          data.alertConfigData[0].direct_alert_id
        );
      }
      this.addAlertConfigForm.patchValue({
        programId: data.alertConfigData[0].vendor_type_id,
        storeList: {
          storeListId: data.alertConfigData[0].store_selection_id,
        },
      });
      this.onStoreListChange('');
    });
  }
  addAlertFormInitialize(data: any) {
    if (data) {
      console.log('Edit data ', data.alertConfigData[0]);
    }
    this.addAlertConfigForm = this.fb.group({
      alertName: [
        data && data.alertConfigData[0].alert_config_name
          ? data.alertConfigData[0].alert_config_name
          : '',
        Validators.required,
      ],
      retailerId: [
        data && data.alertConfigData[0].retailer_id
          ? data.alertConfigData[0].retailer_id
          : '',
        Validators.required,
      ],
      processType: this.fb.group({
        processTypeId: [
          data && data.alertConfigData[0].vendor_type_id
            ? data.alertConfigData[0].vendor_type_id
            : '',
          Validators.required,
        ],
        // vendorAlertingId: [''],
        // directAlertingId: [''],
      }),
      programId: ['', Validators.required],
      storeList: this.fb.group({
        storeListId: ['', Validators.required],
        // storeCluster: [''],
        // storeState: [''],
        // storeCity: [''],
        // storeZipCode: [''],
        // storeGeographyBased: [''],
        // allStore: [''],
      }),
      category: ['', Validators.required],
      brand: ['', Validators.required],
      skuCluster: [''],
      chronicityId: ['', Validators.required],
      alertTypeId: ['', Validators.required],
      alertPerStore: ['', Validators.required],
      alertPrioritization: this.fb.group({
        alertPrioritizationListId: ['', Validators.required],
        // hybirdType: this.fb.group({
        //   hybirdTypeId: [''],
        // }),
        // hybirdTypeId: [''],
      }),
      categoryBasedArray: this.fb.array([]),
      sopCategoryBasedArray: this.fb.array([]),
      brandBasedArray: this.fb.array([]),
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      alertFrequency: this.fb.group({
        alertFrequencyType: ['', Validators.required],
        // alertFrequencyWeekly: this.fb.group({
        //   monday: [''],
        //   tuesday: [''],
        //   wednesday: [''],
        //   thursday: [''],
        //   friday: [''],
        // }),
      }),
      configStatus: [''],
      muteConfiguration: this.fb.group({
        mute: [''],
        muteStartDate: ['', Validators.required],
        muteEndDate: ['', Validators.required],
      }),
    });
  }
  onSubmit(formData: FormGroup) {
    this.addAlertConfigForm.markAllAsTouched();
    if (this.addAlertConfigForm.valid) {
      console.log('Form is valid');
    } else {
      console.log('Form is not valid');
    }
    console.log(formData.value);
    // this.sdoService.saveAlertConfig(formData.value).subscribe((data) => {
    //   console.log(data);
    // });
  }
  onRetailerChange(event: any) {
    //set default value
    this.addAlertConfigForm.patchValue({
      programId: '',
      processType: {
        processTypeId: '',
        vendorAlertingId: '',
        directAlertingId: '',
      },
      storeList: {
        storeListId: '',
        storeCluster: '',
        storeState: '',
        storeCity: '',
        storeZipCode: '',
        storeGeographyBased: '',
        allStore: '',
      },
      alertPrioritization: {
        alertPrioritizationListId: [''],
        hybirdType: {
          hybirdTypeId: [''],
        },
      },
      category: '',
      brand: '',
    });
    // clearing Form Array
    this.removeControls('processType', 'directAlertingId');
    this.removeControls('processType', 'vendorAlertingId');
    this.removeControls('storeList', 'storeCluster');
    this.removeControls('storeList', 'storeState');
    this.removeControls('storeList', 'storeCity');
    this.removeControls('storeList', 'storeZipCode');
    (
      this.addAlertConfigForm.controls['categoryBasedArray'] as FormArray
    ).clear();
    (
      this.addAlertConfigForm.controls['sopCategoryBasedArray'] as FormArray
    ).clear();
    (this.addAlertConfigForm.controls['brandBasedArray'] as FormArray).clear();
    this.programList = [];
    this.categoryList = [];
    this.brandList = [];
    this.populateDataBasedOnRetailer();
  }
  populateDataBasedOnRetailer() {
    let selectedRetailerId = this.addAlertConfigForm?.get('retailerId')?.value;
    // populate data to drop down
    this.storeList = this.allMasterTableData.store_selection;
    // console.log(this.allMasterTableData);
    this.sdoService
      .getStoreDetailsListByRetailerId(selectedRetailerId)
      .subscribe((data) => {
        this.storeDetailsList = data;
        this.categoryList = this.storeDetailsList.category;
        this.skuClusterList = this.storeDetailsList.skuCluster;
        this.storeClusterList = this.storeDetailsList.storeCluster;
        this.storeStateList = this.storeDetailsList.states;
        this.allStoreList = this.storeDetailsList.store;
      });
  }
  onProcessTypeChange(event: any) {
    let selectedProcessTypeId =
      this.addAlertConfigForm.controls['processType']?.get(
        'processTypeId'
      )?.value;
    let selectedRetailerId = this.addAlertConfigForm?.get('retailerId')?.value;
    // add and remove form controls
    if (selectedProcessTypeId === '1') {
      this.addControls('processType', 'vendorAlertingId', '');
      this.removeControls('processType', 'directAlertingId');
    } else if (selectedProcessTypeId === '2') {
      this.addControls('processType', 'directAlertingId', '');
      this.removeControls('processType', 'vendorAlertingId');
    }
    //set default value
    this.addAlertConfigForm.patchValue({
      programId: '',
      processType: {
        vendorAlertingId: '',
        directAlertingId: '',
      },
    });
    this.programList = [];
    // populate data to drop down
    if (selectedProcessTypeId == '1') {
      this.vendorAlertingList = this.allMasterTableData.vendor;
      let dummy = this.vendorAlertingList;
      this.vendorAlertingList = [];
      for (let index = 0; index < dummy.length; index++) {
        if (dummy[index]['retailer_id'] === Number(selectedRetailerId)) {
          this.vendorAlertingList.push(dummy[index]);
        }
      }
    } else if (selectedProcessTypeId == '2') {
      this.directAlertingList = this.allMasterTableData.direct_alert;
    }
  }
  onVendorAlertingChange(event: any) {
    let selectedVendorAlertingId =
      this.addAlertConfigForm.controls['processType']?.get(
        'vendorAlertingId'
      )?.value;
    let selectedProcessTypeId =
      this.addAlertConfigForm.controls['processType']?.get(
        'processTypeId'
      )?.value;
    //set default value
    this.addAlertConfigForm.patchValue({
      programId: '',
    });
    this.programList = [];
    // populate data to drop down
    this.programList = this.allMasterTableData.program;
    let dummy = this.programList;
    this.programList = [];
    for (let index = 0; index < dummy.length; index++) {
      if (
        dummy[index]['vendor_id'] === Number(selectedVendorAlertingId) &&
        dummy[index]['vendor_type_id'] === Number(selectedProcessTypeId)
      ) {
        this.programList.push(dummy[index]);
      }
    }
  }
  onVendorDirectChange(event: any) {
    let selectedDirectAlertingId =
      this.addAlertConfigForm.controls['processType']?.get(
        'directAlertingId'
      )?.value;
    let selectedProcessTypeId =
      this.addAlertConfigForm.controls['processType']?.get(
        'processTypeId'
      )?.value;
    //set default value
    this.addAlertConfigForm.patchValue({
      programId: '',
    });
    this.programList = [];
    // populate data to drop down
    this.programList = this.allMasterTableData.program;
    let dummy = this.programList;
    this.programList = [];
    for (let index = 0; index < dummy.length; index++) {
      if (
        dummy[index]['vendor_id'] === null &&
        dummy[index]['vendor_type_id'] === Number(selectedProcessTypeId)
      ) {
        this.programList.push(dummy[index]);
      }
    }
  }
  onVendorProgramChange(event: any) {
    let selectedVendorProgramId =
      this.addAlertConfigForm?.get('programId')?.value;
  }
  onStoreListChange(event: any) {
    let selectedStoreListId =
      this.addAlertConfigForm.controls['storeList']?.get('storeListId')?.value;
    // add and remove form controls
    if (selectedStoreListId === 1) {
      this.addControls(
        'storeList',
        'storeCluster',
        this.editData.alertConfigData[0].vendor_type_id
      );
      this.removeControls('storeList', 'storeState');
      this.removeControls('storeList', 'storeCity');
      this.removeControls('storeList', 'storeZipCode');
      this.removeControls('storeList', 'storeGeographyBased');
      this.removeControls('storeList', 'allStore');
    } else if (selectedStoreListId === 2) {
      this.addControls('storeList', 'storeState', '');
      this.addControls('storeList', 'storeCity', '');
      this.addControls('storeList', 'storeZipCode', '');
      this.addControls('storeList', 'storeGeographyBased', '');
      this.removeControls('storeList', 'storeCluster');
      this.removeControls('storeList', 'allStore');
    } else if (selectedStoreListId === 3) {
      this.addControls('storeList', 'allStore', '');
      this.removeControls('storeList', 'storeCluster');
      this.removeControls('storeList', 'storeState');
      this.removeControls('storeList', 'storeCity');
      this.removeControls('storeList', 'storeZipCode');
      this.removeControls('storeList', 'storeGeographyBased');
    }
  }
  onStoreListStateChange(event: any) {
    let selectedStateId =
      this.addAlertConfigForm.controls['storeList']?.get('storeState')?.value;
    //set default value
    this.addAlertConfigForm.patchValue({
      storeList: {
        storeCity: '',
        storeZipCode: '',
        storeGeographyBased: '',
      },
    });
    this.storeZipCodeList = [];
    this.storeGeographyBasedList = [];
    // populate data to drop down
    this.storeCityList = this.storeDetailsList.city;
    // this.storeCityList = this.allMasterTableData.city;
    let dummy = this.storeCityList;
    this.storeCityList = [];
    for (let i = 0; i < selectedStateId.length; i++) {
      for (let index = 0; index < dummy.length; index++) {
        if (dummy[index]['state_id'] === Number(selectedStateId[i])) {
          this.storeCityList.push(dummy[index]);
        }
      }
    }
  }
  onStoreListCityChange(event: any) {
    let selectedCityId =
      this.addAlertConfigForm.controls['storeList']?.get('storeCity')?.value;
    //set default value for program
    this.addAlertConfigForm.patchValue({
      storeList: {
        storeZipCode: '',
        storeGeographyBased: '',
      },
    });
    this.storeGeographyBasedList = [];
    // populate data to drop down
    this.storeZipCodeList = this.storeDetailsList.zip;
    // this.storeZipCodeList = this.allMasterTableData.zip;
    let dummy = this.storeZipCodeList;
    this.storeZipCodeList = [];
    for (let i = 0; i < selectedCityId.length; i++) {
      for (let index = 0; index < dummy.length; index++) {
        if (dummy[index]['city_id'] === Number(selectedCityId[i])) {
          this.storeZipCodeList.push(dummy[index]);
        }
      }
    }
  }
  onStoreListZipCodeChange(event: any) {
    let selectedStateId =
      this.addAlertConfigForm.controls['storeList']?.get('storeState')?.value;
    let selectedCityId =
      this.addAlertConfigForm.controls['storeList']?.get('storeCity')?.value;
    let selectedZipId =
      this.addAlertConfigForm.controls['storeList']?.get('storeZipCode')?.value;
    //set default value for program
    this.addAlertConfigForm.patchValue({
      storeList: {
        storeGeographyBased: '',
      },
    });
    this.storeGeographyBasedList = [];
    // populate data to drop down
    let dummy = this.allStoreList;
    this.storeGeographyBasedList = [];
    let stateWise = [],
      cityWise = [],
      zipCodeWise = [];
    for (let state = 0; state < selectedStateId.length; state++) {
      for (let index = 0; index < dummy.length; index++) {
        if (selectedStateId[state] === dummy[index]['state_id']) {
          stateWise.push(dummy[index]);
        }
      }
    }
    for (let city = 0; city < selectedCityId.length; city++) {
      for (let index = 0; index < stateWise.length; index++) {
        if (selectedCityId[city] === stateWise[index]['city_id']) {
          cityWise.push(stateWise[index]);
        }
      }
    }
    for (let zipCode = 0; zipCode < selectedZipId.length; zipCode++) {
      for (let index = 0; index < cityWise.length; index++) {
        if (selectedZipId[zipCode] === cityWise[index]['zip_id']) {
          zipCodeWise.push(cityWise[index]);
        }
      }
    }
    this.storeGeographyBasedList = zipCodeWise;
    // for (let index = 0; index < dummy.length; index++) {
    //   if (
    //     dummy[index]['state_id'] === Number(selectedStateId) &&
    //     dummy[index]['city_id'] === Number(selectedCityId) &&
    //     dummy[index]['zip_id'] === Number(selectedZipId)
    //   ) {
    //     this.storeGeographyBasedList.push(dummy[index]);
    //   }
    // }
  }
  onCategoryChange(event: any) {
    // let combinedCategoryId: any = [];
    let categoryIds = this.addAlertConfigForm.get('category') as FormArray;
    // set default value
    this.addAlertConfigForm.patchValue({
      brand: [''],
    });
    this.brandList = [];
    // populate data to drop down
    (
      this.addAlertConfigForm.controls['categoryBasedArray'] as FormArray
    ).clear();
    (
      this.addAlertConfigForm.controls['sopCategoryBasedArray'] as FormArray
    ).clear();
    for (let index = 0; index < categoryIds.value.length; index++) {
      // if (combinedCategoryId.indexOf(categoryIds.value[index]) == -1) {
      let categoryData: any = this.categoryList.filter(
        (x: any) => x.category_id === categoryIds.value[index]
      );
      // populate Form Array
      this.addNewCategory(
        categoryData[0].category_id,
        categoryData[0].category_name
      );
      // populate Form Array
      this.addNewSopCategory(
        categoryData[0].category_id,
        categoryData[0].category_name
      );
    }
    // }
    // to get brand values
    if (categoryIds.value.length > 0) {
      this.sdoService
        .getBrandListByCategoryId(categoryIds.value)
        .subscribe((data) => {
          this.brandList = data;
          console.log(this.brandList);
        });
    }
  }
  onBrandChange(event: any) {
    let brandIds = this.addAlertConfigForm.get('brand') as FormArray;
    // console.log(brandIds.value);
    // populate data to drop down
    (this.addAlertConfigForm.controls['brandBasedArray'] as FormArray).clear();
    for (let index = 0; index < brandIds.value.length; index++) {
      let brandData: any = this.brandList.filter(
        (x: any) => x.brand_id === brandIds.value[index]
      );
      this.addNewbrand(brandData[0].brand_id, brandData[0].brand_name);
    }
  }
  onAlertFrequencyChange(event: any) {
    let selectedAlertFrequencyChange =
      this.addAlertConfigForm.controls['alertFrequency']?.get(
        'alertFrequencyType'
      )?.value;
    // add group and remove controls
    if (selectedAlertFrequencyChange === 'daily') {
      this.removeControls('alertFrequency', 'alertFrequencyWeekly');
    } else if (selectedAlertFrequencyChange === 'weekly') {
      if (
        !this.addAlertConfigForm
          .get('alertFrequency')
          ?.get('alertFrequencyWeekly')
      ) {
        (this.addAlertConfigForm.get('alertFrequency') as FormGroup).addControl(
          'alertFrequencyWeekly',
          this.fb.group({
            monday: [''],
            tuesday: [''],
            wednesday: [''],
            thursday: [''],
            friday: [''],
          })
        );
      }
    }
  }
  onAlertPrioritizationChange(event: any) {
    let categoryIds = this.addAlertConfigForm.get('category') as FormArray;
    let brandIds = this.addAlertConfigForm.get('brand') as FormArray;
    let selectedAlertPrioritization = this.addAlertConfigForm.controls[
      'alertPrioritization'
    ]?.get('alertPrioritizationListId')?.value;
    if (selectedAlertPrioritization == 'hybridBased') {
      this.addControls('alertPrioritization', 'hybirdTypeId', '');
    } else {
      this.removeControls('alertPrioritization', 'hybirdTypeId');
    }
    if (categoryIds.value.length > 0) {
      this.showPrioritiList = true;
    } else {
      this.showPrioritiList = false;
    }
    if (brandIds.value.length > 0) {
      this.showPrioritiListBrand = true;
    } else {
      this.showPrioritiListBrand = false;
    }
  }
  onAlertPrioritizationHybirdTypeChange(event: any) {
    let selectedAlertPrioritizationHybirdType =
      this.addAlertConfigForm.controls['alertPrioritization']?.get(
        'hybirdTypeId'
      )?.value;
  }
  onChangeStartDate(event: any) {
    var formatedDate = this.dateFormat(event.target.value);
    this.startDate =
      formatedDate[2] + '-' + formatedDate[0] + '-' + formatedDate[1];
    this.startDateSelected = null;
  }
  onChangeMute(event: any) {
    console.log(event.target.checked);
    this.isMute = event.target.checked;
    this.addAlertConfigForm.patchValue({
      muteConfiguration: {
        muteStartDate: '',
        muteEndDate: '',
      },
    });
  }
  onChangeMuteFromDate(event: any) {
    var formatedDate = this.dateFormat(event.target.value);
    this.muteFromDate =
      formatedDate[2] + '-' + formatedDate[0] + '-' + formatedDate[1];
    this.muteDateSelected = null;
  }
  dateFormat(data: any) {
    // Create new Date instance
    var date = new Date(data);
    // Add a day
    date.setDate(date.getDate() + 1);
    var date1 = date.toLocaleDateString();
    return date1.split('/');
  }
  onClickSave() {
    this.popupService.openConfirmDialog(
      'Are you sure you want to save the changes ?'
    );
    // const dialogRef = this.dialog.open(SavePopupComponent);
    // dialogRef.afterClosed().subscribe((result) => {
    //   console.log('The dialog was closed');
    // });
  }
  onClickCancel() {
    this.router.navigate(['summary']);
  }
  // Util Fumctions
  // add control to form dynamically
  addControls(subGroupName: string, controlName: string, initialValue: any) {
    if (!this.addAlertConfigForm.get(subGroupName)?.get(controlName)) {
      (this.addAlertConfigForm.get(subGroupName) as FormGroup).addControl(
        controlName,
        this.fb.control(initialValue, Validators.required)
      );
    }
  }
  // remove control to form dynamically
  removeControls(subGroupName: string, controlName: string) {
    if (this.addAlertConfigForm.get(subGroupName)?.get(controlName)) {
      (this.addAlertConfigForm.get(subGroupName) as FormGroup).removeControl(
        controlName
      );
    }
  }
  // to get form controls for validation
  get form(): { [key: string]: AbstractControl } {
    return this.addAlertConfigForm.controls;
  }
  // form Array methods
  get categoryBasedArray() {
    return this.addAlertConfigForm.get('categoryBasedArray') as FormArray;
  }
  categoryBasedFrom(categoryId: string, categoryName: string) {
    return this.fb.group({
      categoryId: [categoryId],
      categoryName: [categoryName],
      orderNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }
  addNewCategory(categoryId: string, categoryName: string) {
    this.categoryBasedArray.push(
      this.categoryBasedFrom(categoryId, categoryName)
    );
  }
  get sopCategoryBasedArray() {
    return this.addAlertConfigForm.get('sopCategoryBasedArray') as FormArray;
  }
  sopCategoryBasedFrom(categoryId: string, categoryName: string) {
    return this.fb.group({
      sopCategoryId: [categoryId],
      sopCategoryName: [categoryName],
      sopOrderNumber: ['', Validators.required],
    });
  }
  addNewSopCategory(categoryId: string, categoryName: string) {
    this.sopCategoryBasedArray.push(
      this.sopCategoryBasedFrom(categoryId, categoryName)
    );
  }
  get brandBasedArray() {
    return this.addAlertConfigForm.get('brandBasedArray') as FormArray;
  }
  brandBasedFrom(brandId: string, brandName: string) {
    return this.fb.group({
      brandId: [brandId],
      brandName: [brandName],
      orderNumber: ['', Validators.required],
    });
  }
  addNewbrand(brandId: string, brandName: string) {
    this.brandBasedArray.push(this.brandBasedFrom(brandId, brandName));
    console.log(this.brandBasedArray);
  }
}
