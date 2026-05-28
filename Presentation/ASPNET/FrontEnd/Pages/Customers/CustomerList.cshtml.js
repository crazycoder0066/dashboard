const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            customerGroupListLookupData: [],
            customerCategoryListLookupData: [],
            secondaryData: [],
            mainTitle: null,
            manageContactTitle: 'Manage Contact',
            id: '',
            name: '',
            number: '',
            customerGroupId: null,
            customerCategoryId: null,
            description: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            phoneNumber: '',
            faxNumber: '',
            emailAddress: '',
            website: '',
            whatsApp: '',
            linkedIn: '',
            facebook: '',
            instagram: '',
            twitterX: '',
            tikTok: '',
            errors: {
                name: '',
                customerGroupId: '',
                customerCategoryId: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                phoneNumber: '',
                emailAddress: '',
                contactName: '',
            },
            isSubmitting: false,
            hasContactSelection: false,
            contactDeleteMode: false,
            isContactSubmitting: false,
            contactTitle: '',
            contactId: '',
            contactName: '',
            contactJobTitle: '',
            contactPhoneNumber: '',
            contactEmailAddress: '',
            contactDescription: '',
        });

        const mainModalRef = Vue.ref(null);
        const manageContactModalRef = Vue.ref(null);
        const contactModalRef = Vue.ref(null);
        const nameRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const streetRef = Vue.ref(null);
        const cityRef = Vue.ref(null);
        const stateRef = Vue.ref(null);
        const zipCodeRef = Vue.ref(null);
        const countryRef = Vue.ref(null);
        const phoneNumberRef = Vue.ref(null);
        const faxNumberRef = Vue.ref(null);
        const emailAddressRef = Vue.ref(null);
        const websiteRef = Vue.ref(null);
        const whatsAppRef = Vue.ref(null);
        const linkedInRef = Vue.ref(null);
        const facebookRef = Vue.ref(null);
        const instagramRef = Vue.ref(null);
        const twitterXRef = Vue.ref(null);
        const tikTokRef = Vue.ref(null);
        const customerGroupIdRef = Vue.ref(null);
        const customerCategoryIdRef = Vue.ref(null);

        const showModal = () => {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show();
        };
        const hideModal = () => {
            bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide();
        };
        const showContactModal = () => {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('ContactModal'), { backdrop: 'static', keyboard: false }).show();
        };
        const hideContactModal = () => {
            bootstrap.Modal.getInstance(document.getElementById('ContactModal'))?.hide();
        };

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/Customer/GetCustomerList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createMainData: async (name, customerGroupId, customerCategoryId, description, street, city, state, zipCode, country, phoneNumber, faxNumber, emailAddress, website, whatsApp, linkedIn, facebook, instagram, twitterX, tikTok, createdById) => {
                try {
                    const response = await AxiosManager.post('/Customer/CreateCustomer', {
                        name, customerGroupId, customerCategoryId, description, street, city, state, zipCode, country, phoneNumber, faxNumber, emailAddress, website, whatsApp, linkedIn, facebook, instagram, twitterX, tikTok, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateMainData: async (id, name, customerGroupId, customerCategoryId, description, street, city, state, zipCode, country, phoneNumber, faxNumber, emailAddress, website, whatsApp, linkedIn, facebook, instagram, twitterX, tikTok, updatedById) => {
                try {
                    const response = await AxiosManager.post('/Customer/UpdateCustomer', {
                        id, name, customerGroupId, customerCategoryId, description, street, city, state, zipCode, country, phoneNumber, faxNumber, emailAddress, website, whatsApp, linkedIn, facebook, instagram, twitterX, tikTok, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteMainData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/Customer/DeleteCustomer', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getCustomerGroupListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/CustomerGroup/GetCustomerGroupList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getCustomerCategoryListLookupData: async () => {
                try {
                    const response = await AxiosManager.get('/CustomerCategory/GetCustomerCategoryList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            getSecondaryData: async (customerId) => {
                try {
                    const response = await AxiosManager.get('/CustomerContact/GetCustomerContactByCustomerIdList?customerId=' + customerId, {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            createSecondaryData: async (name, jobTitle, phoneNumber, emailAddress, description, customerId, createdById) => {
                try {
                    const response = await AxiosManager.post('/CustomerContact/CreateCustomerContact', {
                        name, jobTitle, phoneNumber, emailAddress, description, customerId, createdById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            updateSecondaryData: async (id, name, jobTitle, phoneNumber, emailAddress, description, customerId, updatedById) => {
                try {
                    const response = await AxiosManager.post('/CustomerContact/UpdateCustomerContact', {
                        id, name, jobTitle, phoneNumber, emailAddress, description, customerId, updatedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
            deleteSecondaryData: async (id, deletedById) => {
                try {
                    const response = await AxiosManager.post('/CustomerContact/DeleteCustomerContact', {
                        id, deletedById
                    });
                    return response;
                } catch (error) {
                    throw error;
                }
            },
        };

        const methods = {
            populateCustomerGroupListLookupData: async () => {
                const response = await services.getCustomerGroupListLookupData();
                state.customerGroupListLookupData = response?.data?.content?.data;
            },
            populateCustomerCategoryListLookupData: async () => {
                const response = await services.getCustomerCategoryListLookupData();
                state.customerCategoryListLookupData = response?.data?.content?.data;
            },
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
            populateSecondaryData: async (customerId) => {
                const response = await services.getSecondaryData(customerId);
                state.secondaryData = response?.data?.content?.data.map(item => ({
                    ...item,
                    createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
        };

        const customerGroupListLookup = {
            obj: null,
            create: () => {
                if (state.customerGroupListLookupData && Array.isArray(state.customerGroupListLookupData)) {
                    customerGroupListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.customerGroupListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select a Customer Group',
                        change: (e) => { state.customerGroupId = e.value; }
                    });
                    customerGroupListLookup.obj.appendTo(customerGroupIdRef.value);
                } else {
                    console.error('Customer Group list lookup data is not available or invalid.');
                }
            },
            refresh: () => { if (customerGroupListLookup.obj) customerGroupListLookup.obj.value = state.customerGroupId; },
        };

        const customerCategoryListLookup = {
            obj: null,
            create: () => {
                if (state.customerCategoryListLookupData && Array.isArray(state.customerCategoryListLookupData)) {
                    customerCategoryListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.customerCategoryListLookupData,
                        fields: { value: 'id', text: 'name' },
                        placeholder: 'Select a Customer Category',
                        change: (e) => { state.customerCategoryId = e.value; }
                    });
                    customerCategoryListLookup.obj.appendTo(customerCategoryIdRef.value);
                } else {
                    console.error('Customer Category list lookup data is not available or invalid.');
                }
            },
            refresh: () => { if (customerCategoryListLookup.obj) customerCategoryListLookup.obj.value = state.customerCategoryId; },
        };

        const nameText = { obj: null, create: () => { nameText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Name' }); nameText.obj.appendTo(nameRef.value); }, refresh: () => { if (nameText.obj) nameText.obj.value = state.name; } };
        const numberText = { obj: null, create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]', readonly: true }); numberText.obj.appendTo(numberRef.value); }, refresh: () => { if (numberText.obj) numberText.obj.value = state.number; } };
        const streetText = { obj: null, create: () => { streetText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Street' }); streetText.obj.appendTo(streetRef.value); }, refresh: () => { if (streetText.obj) streetText.obj.value = state.street; } };
        const cityText = { obj: null, create: () => { cityText.obj = new ej.inputs.TextBox({ placeholder: 'Enter City' }); cityText.obj.appendTo(cityRef.value); }, refresh: () => { if (cityText.obj) cityText.obj.value = state.city; } };
        const stateText = { obj: null, create: () => { stateText.obj = new ej.inputs.TextBox({ placeholder: 'Enter State' }); stateText.obj.appendTo(stateRef.value); }, refresh: () => { if (stateText.obj) stateText.obj.value = state.state; } };
        const zipCodeText = { obj: null, create: () => { zipCodeText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Zip Code' }); zipCodeText.obj.appendTo(zipCodeRef.value); }, refresh: () => { if (zipCodeText.obj) zipCodeText.obj.value = state.zipCode; } };
        const countryText = { obj: null, create: () => { countryText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Country' }); countryText.obj.appendTo(countryRef.value); }, refresh: () => { if (countryText.obj) countryText.obj.value = state.country; } };
        const phoneNumberText = { obj: null, create: () => { phoneNumberText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Phone Number' }); phoneNumberText.obj.appendTo(phoneNumberRef.value); }, refresh: () => { if (phoneNumberText.obj) phoneNumberText.obj.value = state.phoneNumber; } };
        const faxNumberText = { obj: null, create: () => { faxNumberText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Fax Number' }); faxNumberText.obj.appendTo(faxNumberRef.value); }, refresh: () => { if (faxNumberText.obj) faxNumberText.obj.value = state.faxNumber; } };
        const emailAddressText = { obj: null, create: () => { emailAddressText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Email Address' }); emailAddressText.obj.appendTo(emailAddressRef.value); }, refresh: () => { if (emailAddressText.obj) emailAddressText.obj.value = state.emailAddress; } };
        const websiteText = { obj: null, create: () => { websiteText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Website' }); websiteText.obj.appendTo(websiteRef.value); }, refresh: () => { if (websiteText.obj) websiteText.obj.value = state.website; } };
        const whatsAppText = { obj: null, create: () => { whatsAppText.obj = new ej.inputs.TextBox({ placeholder: 'Enter WhatsApp' }); whatsAppText.obj.appendTo(whatsAppRef.value); }, refresh: () => { if (whatsAppText.obj) whatsAppText.obj.value = state.whatsApp; } };
        const linkedInText = { obj: null, create: () => { linkedInText.obj = new ej.inputs.TextBox({ placeholder: 'Enter LinkedIn' }); linkedInText.obj.appendTo(linkedInRef.value); }, refresh: () => { if (linkedInText.obj) linkedInText.obj.value = state.linkedIn; } };
        const facebookText = { obj: null, create: () => { facebookText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Facebook' }); facebookText.obj.appendTo(facebookRef.value); }, refresh: () => { if (facebookText.obj) facebookText.obj.value = state.facebook; } };
        const instagramText = { obj: null, create: () => { instagramText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Instagram' }); instagramText.obj.appendTo(instagramRef.value); }, refresh: () => { if (instagramText.obj) instagramText.obj.value = state.instagram; } };
        const twitterXText = { obj: null, create: () => { twitterXText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Twitter/X' }); twitterXText.obj.appendTo(twitterXRef.value); }, refresh: () => { if (twitterXText.obj) twitterXText.obj.value = state.twitterX; } };
        const tikTokText = { obj: null, create: () => { tikTokText.obj = new ej.inputs.TextBox({ placeholder: 'Enter TikTok' }); tikTokText.obj.appendTo(tikTokRef.value); }, refresh: () => { if (tikTokText.obj) tikTokText.obj.value = state.tikTok; } };

        Vue.watch(() => state.name, () => { state.errors.name = ''; nameText.refresh(); });
        Vue.watch(() => state.number, () => { numberText.refresh(); });
        Vue.watch(() => state.customerGroupId, () => { state.errors.customerGroupId = ''; customerGroupListLookup.refresh(); });
        Vue.watch(() => state.customerCategoryId, () => { state.errors.customerCategoryId = ''; customerCategoryListLookup.refresh(); });
        Vue.watch(() => state.street, () => { state.errors.street = ''; streetText.refresh(); });
        Vue.watch(() => state.city, () => { state.errors.city = ''; cityText.refresh(); });
        Vue.watch(() => state.state, () => { state.errors.state = ''; stateText.refresh(); });
        Vue.watch(() => state.zipCode, () => { state.errors.zipCode = ''; zipCodeText.refresh(); });
        Vue.watch(() => state.country, () => { state.errors.country = ''; countryText.refresh(); });
        Vue.watch(() => state.phoneNumber, () => { state.errors.phoneNumber = ''; phoneNumberText.refresh(); });
        Vue.watch(() => state.emailAddress, () => { state.errors.emailAddress = ''; emailAddressText.refresh(); });

        const resetFormState = () => {
            state.id = ''; state.number = ''; state.name = ''; state.customerGroupId = null; state.customerCategoryId = null;
            state.description = ''; state.street = ''; state.city = ''; state.state = ''; state.zipCode = '';
            state.country = ''; state.phoneNumber = ''; state.faxNumber = ''; state.emailAddress = '';
            state.website = ''; state.whatsApp = ''; state.linkedIn = ''; state.facebook = '';
            state.instagram = ''; state.twitterX = ''; state.tikTok = '';
            state.errors = { name: '', customerGroupId: '', customerCategoryId: '', street: '', city: '', state: '', zipCode: '', country: '', phoneNumber: '', emailAddress: '', contactName: '' };
        };

        const resetContactFormState = () => {
            state.contactId = ''; state.contactName = ''; state.contactJobTitle = '';
            state.contactPhoneNumber = ''; state.contactEmailAddress = ''; state.contactDescription = '';
            state.errors.contactName = '';
        };

        const mainGrid = {
            obj: null,
            create: (dataSource) => {
                mainGrid.obj = new DataTable('#mainGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'number', title: 'Number' },
                        { data: 'name', title: 'Name' },
                        { data: 'customerGroupName', title: 'Group' },
                        { data: 'customerCategoryName', title: 'Category' },
                        { data: 'street', title: 'Street' },
                        { data: 'phoneNumber', title: 'Phone' },
                        { data: 'emailAddress', title: 'Email' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[7, 'desc']],
                    pageLength: 50,
                    lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Customers', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
                mainGrid.obj.on('select deselect', () => { state.hasSelection = mainGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); },
            _populateState: (row) => {
                state.id = row.id ?? ''; state.number = row.number ?? ''; state.name = row.name ?? '';
                state.customerGroupId = row.customerGroupId ?? null; state.customerCategoryId = row.customerCategoryId ?? null;
                state.description = row.description ?? ''; state.street = row.street ?? ''; state.city = row.city ?? '';
                state.state = row.state ?? ''; state.zipCode = row.zipCode ?? ''; state.country = row.country ?? '';
                state.phoneNumber = row.phoneNumber ?? ''; state.faxNumber = row.faxNumber ?? '';
                state.emailAddress = row.emailAddress ?? ''; state.website = row.website ?? '';
                state.whatsApp = row.whatsApp ?? ''; state.linkedIn = row.linkedIn ?? ''; state.facebook = row.facebook ?? '';
                state.instagram = row.instagram ?? ''; state.twitterX = row.twitterX ?? ''; state.tikTok = row.tikTok ?? '';
            }
        };

        const secondaryGrid = {
            obj: null,
            create: (dataSource) => {
                secondaryGrid.obj = new DataTable('#secondaryGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'name', title: 'Name' },
                        { data: 'jobTitle', title: 'Job Title' },
                        { data: 'phoneNumber', title: 'Phone' },
                        { data: 'emailAddress', title: 'Email' },
                        { data: 'description', title: 'Description' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[5, 'desc']],
                    pageLength: 10,
                    lengthMenu: [[10, 25, 50, -1], ['10', '25', '50', 'All']],
                    select: { style: 'single', info: false },
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
                secondaryGrid.obj.on('select deselect', () => { state.hasContactSelection = secondaryGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { secondaryGrid.obj.clear().rows.add(state.secondaryData).draw(); },
            _populateState: (row) => {
                state.contactId = row.id ?? ''; state.contactName = row.name ?? ''; state.contactJobTitle = row.jobTitle ?? '';
                state.contactPhoneNumber = row.phoneNumber ?? ''; state.contactEmailAddress = row.emailAddress ?? '';
                state.contactDescription = row.description ?? '';
            }
        };

        const manageContactModal = {
            obj: null,
            create: () => { manageContactModal.obj = new bootstrap.Modal(manageContactModalRef.value, { backdrop: 'static', keyboard: false }); }
        };

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Customer'; resetFormState(); showModal(); },
            openEdit: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = false; state.mainTitle = 'Edit Customer'; mainGrid._populateState(row); showModal(); },
            openDelete: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = true; state.mainTitle = 'Delete Customer?'; mainGrid._populateState(row); showModal(); },
            openManageContact: async () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0];
                if (!row) return;
                state.id = row.id ?? '';
                state.manageContactTitle = 'Manage Contact';
                await methods.populateSecondaryData(state.id);
                secondaryGrid.refresh();
                manageContactModal.obj.show();
            },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 200));

                    let isValid = true;
                    if (!state.name) { state.errors.name = 'Name is required.'; isValid = false; }
                    if (!state.customerGroupId) { state.errors.customerGroupId = 'Customer Group is required.'; isValid = false; }
                    if (!state.customerCategoryId) { state.errors.customerCategoryId = 'Customer Category is required.'; isValid = false; }
                    if (!state.street) { state.errors.street = 'Street is required.'; isValid = false; }
                    if (!state.city) { state.errors.city = 'City is required.'; isValid = false; }
                    if (!state.state) { state.errors.state = 'State is required.'; isValid = false; }
                    if (!state.zipCode) { state.errors.zipCode = 'Zip Code is required.'; isValid = false; }
                    if (!state.country) { state.errors.country = 'Country is required.'; isValid = false; }
                    if (!state.phoneNumber) { state.errors.phoneNumber = 'Phone Number is required.'; isValid = false; }
                    if (!state.emailAddress) { state.errors.emailAddress = 'Email Address is required.'; isValid = false; }
                    if (!isValid) return;

                    const response = state.id === ''
                        ? await services.createMainData(state.name, state.customerGroupId, state.customerCategoryId, state.description, state.street, state.city, state.state, state.zipCode, state.country, state.phoneNumber, state.faxNumber, state.emailAddress, state.website, state.whatsApp, state.linkedIn, state.facebook, state.instagram, state.twitterX, state.tikTok, StorageManager.getUserId())
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.name, state.customerGroupId, state.customerCategoryId, state.description, state.street, state.city, state.state, state.zipCode, state.country, state.phoneNumber, state.faxNumber, state.emailAddress, state.website, state.whatsApp, state.linkedIn, state.facebook, state.instagram, state.twitterX, state.tikTok, StorageManager.getUserId());

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();
                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Customer';
                            const d = response?.data?.content?.data;
                            state.id = d.id ?? ''; state.number = d.number ?? ''; state.name = d.name ?? '';
                            state.customerGroupId = d.customerGroupId ?? null; state.customerCategoryId = d.customerCategoryId ?? null;
                            state.description = d.description ?? ''; state.street = d.street ?? ''; state.city = d.city ?? '';
                            state.state = d.state ?? ''; state.zipCode = d.zipCode ?? ''; state.country = d.country ?? '';
                            state.phoneNumber = d.phoneNumber ?? ''; state.faxNumber = d.faxNumber ?? '';
                            state.emailAddress = d.emailAddress ?? ''; state.website = d.website ?? '';
                            state.whatsApp = d.whatsApp ?? ''; state.linkedIn = d.linkedIn ?? ''; state.facebook = d.facebook ?? '';
                            state.instagram = d.instagram ?? ''; state.twitterX = d.twitterX ?? ''; state.tikTok = d.tikTok ?? '';
                        }
                        Swal.fire({ icon: 'success', title: state.deleteMode ? 'Delete Successful' : 'Save Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { hideModal(); if (state.deleteMode) resetFormState(); }, 2000);
                    } else {
                        Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' });
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'An Error Occurred', text: error.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' });
                } finally {
                    state.isSubmitting = false;
                }
            },
            openAddContact: () => { state.contactDeleteMode = false; state.contactTitle = 'Add Contact'; resetContactFormState(); showContactModal(); },
            openEditContact: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.contactDeleteMode = false; state.contactTitle = 'Edit Contact'; secondaryGrid._populateState(row); showContactModal(); },
            openDeleteContact: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.contactDeleteMode = true; state.contactTitle = 'Delete Contact?'; secondaryGrid._populateState(row); showContactModal(); },
            handleContactSubmit: async function () {
                try {
                    state.isContactSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 200));
                    if (!state.contactDeleteMode && !state.contactName) { state.errors.contactName = 'Name is required.'; return; }
                    const response = state.contactId === ''
                        ? await services.createSecondaryData(state.contactName, state.contactJobTitle, state.contactPhoneNumber, state.contactEmailAddress, state.contactDescription, state.id, StorageManager.getUserId())
                        : state.contactDeleteMode
                            ? await services.deleteSecondaryData(state.contactId, StorageManager.getUserId())
                            : await services.updateSecondaryData(state.contactId, state.contactName, state.contactJobTitle, state.contactPhoneNumber, state.contactEmailAddress, state.contactDescription, state.id, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateSecondaryData(state.id);
                        secondaryGrid.refresh();
                        Swal.fire({ icon: 'success', title: state.contactDeleteMode ? 'Delete Successful' : 'Save Successful', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { hideContactModal(); if (state.contactDeleteMode) resetContactFormState(); }, 2000);
                    } else {
                        Swal.fire({ icon: 'error', title: 'Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' });
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'An Error Occurred', text: error.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' });
                } finally {
                    state.isContactSubmitting = false;
                }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['Customers']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                mainGrid.create(state.mainData);

                await methods.populateCustomerGroupListLookupData();
                customerGroupListLookup.create();
                await methods.populateCustomerCategoryListLookupData();
                customerCategoryListLookup.create();

                nameText.create(); numberText.create(); streetText.create(); cityText.create();
                stateText.create(); zipCodeText.create(); countryText.create(); phoneNumberText.create();
                faxNumberText.create(); emailAddressText.create(); websiteText.create(); whatsAppText.create();
                linkedInText.create(); facebookText.create(); instagramText.create(); twitterXText.create(); tikTokText.create();

                manageContactModal.create();
                secondaryGrid.create([]);

                mainModalRef.value?.addEventListener('hidden.bs.modal', () => resetFormState());
                contactModalRef.value?.addEventListener('hidden.bs.modal', () => resetContactFormState());
            } catch (e) {
                console.error('page init error:', e);
            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', resetFormState);
            contactModalRef.value?.removeEventListener('hidden.bs.modal', resetContactFormState);
            if (mainGrid.obj) mainGrid.obj.destroy();
            if (secondaryGrid.obj) secondaryGrid.obj.destroy();
        });

        return {
            mainModalRef,
            manageContactModalRef,
            contactModalRef,
            nameRef, numberRef, streetRef, cityRef, stateRef, zipCodeRef, countryRef,
            phoneNumberRef, faxNumberRef, emailAddressRef, websiteRef,
            whatsAppRef, linkedInRef, facebookRef, instagramRef, twitterXRef, tikTokRef,
            customerGroupIdRef, customerCategoryIdRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');
