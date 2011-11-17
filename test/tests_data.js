// ###############################################################################
// 		CATGEORY
// ###############################################################################
exports.category_1 = null;

exports.category_2 = {
	title : 'TITLE_CATEGORY_2',
	description : 'DESCRIPTION_CATEGORY_2',
	id: "/category/8de0ea0cda9af2ff9be086310e650756",
	updateDate: "2011-11-02T16:03:18.634Z", 
	createDate : '2011-11-02T16:03:18.634Z',	
	author:"/user/staff"
}

exports.category_3 = {
	title : 'TITLE_CATEGORY_3',
	description : 'DESCRIPTION_CATEGORY_3',
	createDate : '2011-11-02T16:04:14.092Z',
	updateDate : '2011-11-02T16:04:14.092Z',
	id : '/category/ee47f900c7d8ee5ac5b0369f2b182e05',	
	author:"/user/staff"
}

exports.category_4 = {
	title : 'TITLE_CATEGORY_4',
	description : 'DESCRIPTION_AGENDA_4',
	createDate : '2011-11-02T16:05:12.404Z',
	updateDate : '2011-11-02T16:05:12.404Z',
	id : '/category/98702b8906c9589c573b9d7de1c63bb5',	
	author:"/user/staff"
}

exports.category_integrity_error = "/category/34b74b021369bb23e67f22bad8f1229a";

// ###############################################################################
// 		AGENDA
// ###############################################################################
exports.agenda_1 = null;

exports.agenda_2 = {
	title : 'TITLE_AGENDA_2',
	description : 'DESCRIPTION_AGENDA_2',
	id : '/agenda/title-agenda-2',
	updateDate : '2011-09-21T12:47:31.116Z',
	createDate : '2011-09-21T12:47:31.116Z',
	writeUsers : '/agenda/title-agenda-2/perms/wu',
	writeGroups : '/agenda/title-agenda-2/perms/wg',
	author:"/user/test"
}

exports.agenda_3 = {
	title : 'TITLE_AGENDA_3',
	description : 'DESCRIPTION_AGENDA_3',
	createDate : '2011-09-21T12:47:31.117Z',
	updateDate : '2011-09-21T12:47:31.117Z',
	id : '/agenda/title-agenda-3',
	writeUsers : '/agenda/title-agenda-3/perms/wu',
	writeGroups : '/agenda/title-agenda-3/perms/wg',
	author:"/user/test"
}

exports.agenda_4 = {
	title : 'TITLE_AGENDA_4',
	description : 'DESCRIPTION_AGENDA_4',
	createDate : '2011-09-21T12:47:31.115Z',
	updateDate : '2011-09-21T12:47:31.115Z',
	id : '/agenda/title-agenda-4',
	writeUsers : '/agenda/title-agenda-4/perms/wu',
	writeGroups : '/agenda/title-agenda-4/perms/wg',
	author:"/user/test"
}

exports.agenda_forbidden_1 = "/agenda/agenda-perms-forbidden-1";
exports.agenda_forbidden_2 = "/agenda/agenda-perms-forbidden-2";
exports.agenda_forbidden_3 = "/agenda/agenda-forbidden-3";
exports.agenda_group_access_1 = "/agenda/agenda-perms-group-access-1";
exports.agenda_group_access_2 = "/agenda/agenda-perms-group-access-2";
exports.agenda_group_access_3 = "/agenda/agenda-perms-group-access-3";

exports.agenda_integrity_error = "/agenda/agenda-for-integrity-test";

// ###############################################################################
// 		EVENT
// ###############################################################################
exports.event_1 = {
	id : '/event/295384e87e6c0761caec6995a7922f44',
	updateDate : '2011-09-21T12:56:22.192Z',
	createDate : '2011-09-21T12:56:22.192Z',
	writeUsers : '/event/295384e87e6c0761caec6995a7922f44/perms/wu',
	writeGroups : '/event/295384e87e6c0761caec6995a7922f44/perms/wg',
	readUsers : '/event/295384e87e6c0761caec6995a7922f44/perms/ru',
	readGroups : '/event/295384e87e6c0761caec6995a7922f44/perms/rg',
	author : '/user/login-user-2',
	event : {
		title : 'title event 1',
		links : [{rel:"describedby", href:"/schema/event"}],
		where : [{valueString:"Pau"}],
		category : "/category/34b74b021369bb23e67f22bad8f1229a",
		when:[{startTime:"2001-12-09"}],
		eventStatus : "confirmed"
	},
	agenda : null
}

exports.event_2 = {
	id : '/event/80c22a5b8fa95ddbe73ac218a07704bc',
	createDate : '2011-09-21T12:56:22.193Z',
	updateDate : '2011-10-12T10:55:33.233Z',
	writeUsers : '/event/80c22a5b8fa95ddbe73ac218a07704bc/perms/wu',
	writeGroups : '/event/80c22a5b8fa95ddbe73ac218a07704bc/perms/wg',
	readUsers : '/event/80c22a5b8fa95ddbe73ac218a07704bc/perms/ru',
	readGroups : '/event/80c22a5b8fa95ddbe73ac218a07704bc/perms/rg',
	author : '/user/login-user-2',
	event : {
		title : 'title event 2',
		links : [{rel:"describedby", href:"/schema/event"}],
		where : [{valueString:"Pau"}],
		category : "/category/34b74b021369bb23e67f22bad8f1229a",
		when:[{startTime:"2001-12-09"}],
		eventStatus : "confirmed"
	},
	agenda : null
}

exports.event_3 = {
	id : '/event/d9adce07499071b73636aafbfe91aa78',
	createDate : '2011-09-21T12:56:22.189Z',
	updateDate : '2011-09-21T12:56:22.189Z',
	writeUsers : '/event/d9adce07499071b73636aafbfe91aa78/perms/wu',
	writeGroups : '/event/d9adce07499071b73636aafbfe91aa78/perms/wg',
	readUsers : '/event/d9adce07499071b73636aafbfe91aa78/perms/ru',
	readGroups : '/event/d9adce07499071b73636aafbfe91aa78/perms/rg',
	author : '/user/login-user-2',
	event : {
		title : 'title event 3',
		links : [{rel:"describedby", href:"/schema/event"}],
		where : [{valueString:"Pau"}],
		category : "/category/34b74b021369bb23e67f22bad8f1229a",
		when:[{startTime:"2001-12-09"}],
		eventStatus : "confirmed"
	},
	agenda : null
}

exports.event_forbidden_1 = "/event/7fcd6c1756deb3d5e0d853fcc3d7adab";
exports.event_forbidden_2 = "/event/b7344ee057a39399a94827a8338c0c23";
exports.event_group_access_1 = "/event/b5737c7b02fb4c027ee5fbfde0274051";
exports.event_group_access_2 = "/event/6891dad3d922b0c01b1330ab0138c6b2";

exports.event_master_fail_1 = "/event/76c539cb3aa818074d51d2d40757a03e";
exports.event_master_fail_2 = "/event/19d81417c48fc4266018f4ed94db71af";
exports.event_master_successful_1 = "/event/428d45710f8099fa8c63999386bbe7cf";
exports.event_master_successful_2 = "/event/d5fe6d835f16fb81f6fdd4da37c5c308";
exports.event_master_successful_3 = "/event/2305c45114c6449dbe5fe46249ce8217";
exports.event_subevent_1 = "/event/c6afce8b7f209f7a7bfe32125f3efba4";

// ###############################################################################
// 		ENTITY
// ###############################################################################
exports.entity_1 = {
	id : '/entity/69e2d155f49177d5f805fd56f3b61075',
	updateDate : '2011-10-27T13:41:54.986Z',
	createDate : '2011-10-27T13:41:54.986Z',
	writeUsers : '/entity/69e2d155f49177d5f805fd56f3b61075/perms/wu',
	writeGroups : '/entity/69e2d155f49177d5f805fd56f3b61075/perms/wg',	
	author : '/user/test',
	entity : {
		type : "organization",
		name : 'name entity 1',
		links : [{rel:"describedby", href:"/schema/organization"}],
		where : [{valueString:"Pau"}]
	}
}

exports.entity_2 = {
	id : '/entity/d78aa30894222ba03dd2c0c68fd108c9',
	createDate : '2011-10-27T13:43:22.261Z',
	updateDate : '2011-10-27T13:43:22.261Z',
	writeUsers : '/entity/d78aa30894222ba03dd2c0c68fd108c9/perms/wu',
	writeGroups : '/entity/d78aa30894222ba03dd2c0c68fd108c9/perms/wg',	
	author : '/user/test',
	entity : {
		type : "organization",
		name : 'name entity 2',
		links : [{rel:"describedby", href:"/schema/organization"}],
		where : [{valueString:"Pau"}]
	}
}

exports.entity_3 = {
	id : '/entity/5e3c77142f094b228f9f3faf5b68744c',
	createDate : '2011-10-27T13:44:00.426Z',
	updateDate : '2011-10-27T13:44:00.426Z',
	writeUsers : '/entity/5e3c77142f094b228f9f3faf5b68744c/perms/wu',
	writeGroups : '/entity/5e3c77142f094b228f9f3faf5b68744c/perms/wg',	
	author : '/user/test',
	entity : {
		type : "organization",
		name : 'name entity 3',
		links : [{rel:"describedby", href:"/schema/organization"}],
		where : [{valueString:"Pau"}]
	}
}

exports.entity_4 = {
	id : '/entity/d6663b1d306292f66674815d4fefe2d9',
	createDate : '2011-10-27T14:43:45.934Z',
	updateDate : '2011-10-27T14:43:45.934Z',
	writeUsers : '/entity/d6663b1d306292f66674815d4fefe2d9/perms/wu',
	writeGroups : '/entity/d6663b1d306292f66674815d4fefe2d9/perms/wg',	
	author : '/user/test',
	entity : {
		type : "organization",
		name : 'name entity 4',
		links : [{rel:"describedby", href:"/schema/organization"}],
		where : [{valueString:"Pau"}]
	}
}

exports.entity_5 = {
	id : '/entity/8f9a903fce4570664d9f32eb4b229b69',
	createDate : '2011-10-27T14:44:21.365Z',
	updateDate : '2011-10-27T14:44:21.365Z',
	writeUsers : '/entity/8f9a903fce4570664d9f32eb4b229b69/perms/wu',
	writeGroups : '/entity/8f9a903fce4570664d9f32eb4b229b69/perms/wg',	
	author : '/user/test',
	entity : {
		type : "organization",
		name : 'name entity 5',
		links : [{rel:"describedby", href:"/schema/organization"}],
		where : [{valueString:"Pau"}]
	}
}


exports.entity_forbidden_1 = "/entity/1f3fa26e61cc482c128f57dbffa536ec";
exports.entity_forbidden_2 = "/entity/4d88377cca2ecae7df5a71fb4a664195";
exports.entity_group_access_1 = "/entity/de165adb46f14a6425b4b9bcd120485e";
exports.entity_group_access_2 = "/entity/993cc34eace067a0d0e01f8d81d85706";

exports.entity_integrity_error = "/entity/5380ed6370dc23cdd3484d8a2b8fffde";

// ###############################################################################
// 		GROUP
// ###############################################################################
exports.group_1 = null;
exports.group_2 = {
	title : 'TITLE_GROUP_2',
	description : 'DESCRIPTION_GROUP_2',
	id : '/group/title-group-2',
	users : '/group/title-group-2/users',
	updateDate : '2011-09-21T13:18:38.297Z',
	createDate : '2011-09-21T13:18:38.297Z',
	writeUsers : '/group/title-group-2/perms/wu',
	writeGroups : '/group/title-group-2/perms/wg'
}



exports.group_3 = {
	title : 'TITLE_GROUP_3',
	description : 'DESCRIPTION_GROUP_3',
	createDate : '2011-09-22T14:27:23.831Z',
	updateDate : '2011-09-22T14:27:23.831Z',
	id : '/group/title-group-3',
	users : '/group/title-group-3/users',
	writeUsers : '/group/title-group-3/perms/wu',
	writeGroups : '/group/title-group-3/perms/wg'
}

exports.group_4 = {
	title : 'TITLE_GROUP_4',
	description : 'DESCRIPTION_GROUP_4',
	createDate : '2011-09-22T14:27:23.830Z',
	updateDate : '2011-09-22T14:27:23.830Z',
	id : '/group/title-group-4',
	users : '/group/title-group-4/users',
	writeUsers : '/group/title-group-4/perms/wu',
	writeGroups : '/group/title-group-4/perms/wg'
}

exports.group_5 = {
	title : 'TITLE_GROUP_5',
	description : 'DESCRIPTION_GROUP_5',
	createDate : '2011-09-21T13:18:38.296Z',
	updateDate : '2011-09-21T13:18:38.296Z',
	id : '/group/title-group-5',
	users : '/group/title-group-5/users',
	writeUsers : '/group/title-group-5/perms/wu',
	writeGroups : '/group/title-group-5/perms/wg'
}

exports.group_6 = {
  "description": "DESCRIPTION_GROUP_6", 
  "title": "TITLE_GROUP_6", 
  "createDate": "2011-10-17T09:01:18.853Z", 
  "writeGroups": "/group/title-group-6/perms/wg", 
  "updateDate": "2011-10-17T09:01:18.853Z", 
  "users": "/group/title-group-6/users", 
  "id": "/group/title-group-6", 
  "writeUsers": "/group/title-group-6/perms/wu"
}

exports.group_forbidden_1 = "/group/group-perms-forbidden-1";
exports.group_forbidden_2 = "/group/group-perms-forbidden-2";
exports.group_group_access_1 = "/group/group-perms-group-access-1";
exports.group_group_access_2 = "/group/group-perms-group-access-2";

exports.group_integrity_error = "/group/group-test-for-integrity"

// ###############################################################################
// 		SCHEMA
// ###############################################################################
exports.schema_1 = null;
exports.schema_2 ={
	id : '/schema/name-schema-2',
	name : 'NAME_SCHEMA_2',
	updateDate : '2011-09-21T13:47:40.034Z',
	createDate : '2011-09-21T13:47:40.034Z',
	'final' : false,
	status : 'PROPOSAL',
	sample : '',
	template : '',
	author:"/user/test",
	description : null,
	schema : {
		id : '/schema/name-schema-2'
	}
}

exports.schema_3 = {
	id : '/schema/name-schema-3',
	name : 'NAME_SCHEMA_3',
	updateDate : '2011-09-21T13:47:40.036Z',
	createDate : '2011-09-21T13:47:40.036Z',
	'final' : true,
	status : 'APPROVED',
	sample : 'sample data',
	template : 'template data',
	author:"/user/test",
	description : null,
	schema : {
		id :  '/schema/name-schema-3',
		description : 'schema description'
	}
}

exports.schema_4 = {
	id : '/schema/name-schema-4',
	name : 'NAME_SCHEMA_4',
	updateDate : '2011-09-21T13:54:47.513Z',
	createDate : '2011-09-21T13:54:47.513Z',
	'final' : true,
	status : 'APPROVED',
	sample : 'sample data',
	template : 'template data',
	author:"/user/test",
	description : null,
	schema : {
		id :  '/schema/name-schema-4',
		description : 'schema description'
	}
}

// ###############################################################################
// 		USER
// ###############################################################################
exports.user_1 = null;

exports.user_2 = {
	firstName : 'FIRST_NAME_USER_2',
	lastName : 'LAST_NAME_USER_2',
	email : 'EMAIL_USER_2@domain.com',
	login : 'LOGIN_USER_2',
	isActive : false,
	isStaff : false,
	isSuperuser : false,
	lastSeen: null,
	joinedDate: null,	
	id : '/user/login-user-2',
	createDate : '2011-09-21T14:10:27.222Z',
	updateDate : '2011-09-21T14:10:27.222Z',
	groups : '/user/login-user-2/groups'
}

exports.user_3 = {
	firstName : 'FIRST_NAME_USER_3',
	lastName : 'LAST_NAME_USER_3',
	email : 'EMAIL_USER_3@domain.com',	
	login : 'LOGIN_USER_3',
	isActive : false,
	isStaff : false,
	isSuperuser : false,
	lastSeen:'2011-09-08T13:40:00.000Z',
	joinedDate: '2011-09-08T13:30:00.000Z',
	createDate : '2011-09-21T14:10:27.223Z',
	updateDate : '2011-09-21T14:10:27.223Z',
	id : '/user/login-user-3',	
	groups : '/user/login-user-3/groups'
}

exports.user_4 = {
	firstName : 'FIRST_NAME_USER_4',
	lastName : 'LAST_NAME_USER_4',
	email : 'EMAIL_USER_4@domain.com',
	login : 'LOGIN_USER_4',
	isActive : false,
	isStaff : false,
	isSuperuser : false,
	lastSeen:'2011-09-08T13:40:00.000Z',
	joinedDate: '2011-09-08T13:30:00.000Z',
	createDate : '2011-09-08T13:30:00.000Z',
	updateDate : '2011-09-08T13:30:00.000Z',
	id : '/user/login-user-4',
	groups : '/user/login-user-4/groups'
}

exports.user_5 ={
	firstName : 'FIRST_NAME_USER_5',
	lastName : 'LAST_NAME_USER_5',
	email : 'EMAIL_USER_5@domain.com',
	login : 'LOGIN_USER_5',
	isActive : false,
	isStaff : false,
	isSuperuser : false,
	lastSeen:'2011-09-08T13:40:00.000Z',
	joinedDate: '2011-09-08T13:30:00.000Z',
	createDate : '2011-09-21T14:10:27.221Z',
	updateDate : '2011-09-21T14:10:27.221Z',
	id : '/user/login-user-5',
	groups : '/user/login-user-5/groups'
}

exports.user_6 = {
	firstName : 'FIRST_NAME_USER_6',
	lastName : 'LAST_NAME_USER_6',
	email : 'EMAIL_USER_6@domain.com',
	login : 'LOGIN_USER_6',
	isActive : false,
	isStaff : false,
	isSuperuser : false,
	lastSeen:'2011-09-08T13:40:00.000Z',
	joinedDate: '2011-09-08T13:30:00.000Z',
	createDate : '2011-09-21T14:10:27.220Z',
	updateDate : '2011-09-21T14:10:27.220Z',
	id : '/user/login-user-6',
	groups : '/user/login-user-6/groups'
}

exports.user_7 = {
	firstName : 'FIRST_NAME_USER_7',
	lastName : 'LAST_NAME_USER_7',
	email : 'EMAIL_USER_7@domain.com',
	login : 'LOGIN_USER_7',
	isActive : false,
	isStaff : false,
	isSuperuser : false,
	lastSeen:'2011-09-08T13:40:00.000Z',
	joinedDate: '2011-09-08T13:30:00.000Z',
	createDate : '2011-09-21T14:11:43.703Z',
	updateDate : '2011-09-21T14:11:43.703Z',
	id : '/user/login-user-7',
	groups : '/user/login-user-7/groups'
}

exports.user_test = {
        isActive: true,
        lastName: 'test',
        lastSeen: null,
        isSuperuser: false,
        login: 'test',
        joinedDate: null,
        firstName: 'test',
        createDate: '2011-10-06T14:52:56.382Z',
        isStaff: false,
        groups: '/user/test/groups',
        updateDate: '2011-10-06T14:52:56.382Z',
        id: '/user/test'
    }

// ###############################################################################
// 		MEMBERSHIP
// ###############################################################################

exports.membership_user_5_group_5 = '/membership/c4d4341d5ada5492bee888db0cc902dd'
exports.membership_user_7_group_5 = '/membership/391e1344d06661e7cf087d00d8cbace3'


// ###############################################################################
// 		PERMISSIONS
// ###############################################################################

exports.perms_agenda_2_write_group_2 = '/perms/agenda/wg/4f2cc8435412530726af48d8cbf3c60a'
exports.perms_agenda_2_write_user_test = '/perms/agenda/wu/181f732cd8553a6f844cf19f53cfae67'

exports.perms_agenda_3_write_group_2 = '/perms/agenda/wg/ed916a5c649389e1ce261823437ef32e'
exports.perms_agenda_3_write_user_2 = '/perms/agenda/wu/a0b0ed1b9e71727aa122b9128c92f060'

exports.perms_group_3_write_group_2 = '/perms/group/wg/88e0d2e1a98eaf4bf1fee2e845bbc1a2'
exports.perms_group_3_write_user_test = '/perms/group/wu/04148c5b74052f609c1751beff379e5e'

exports.perms_group_5_write_group_2 = '/perms/group/wg/186971137cf9faa08817bd4d6a8f1b88'
exports.perms_group_5_write_user_2 = '/perms/group/wu/27a116182057a8be34749e55c02b1e52'

exports.perms_event_1_write_group_2 = '/perms/event/wg/b5c3e304a201d0c67c43b9e9611fb4f0'
exports.perms_event_1_write_user_test = '/perms/event/wu/af92daa4e829e98376e422fdd196370d'
exports.perms_event_1_read_group_2 = '/perms/event/rg/ef822b475a692b42cab1188a015a1b13'
exports.perms_event_1_read_user_test = '/perms/event/ru/6657c5dc3d95167b58abc8af2be24284'

exports.perms_event_2_write_group_2 = '/perms/event/wg/d9df03cef399b0518e8409b102badb84'
exports.perms_event_2_write_user_2 = '/perms/event/wu/72606c3ffbf91ff903a0ee1ac0ff47ec'
exports.perms_event_2_read_group_2 = '/perms/event/rg/bdedb9616439fa47c56b6d27e5f2b66a'
exports.perms_event_2_read_user_2 = '/perms/event/ru/0eff9f1e23304eda1a90b0dfc9c281bc'

exports.perms_entity_4_write_group_2 = '/perms/entity/wg/908e3d04932eeb0bef5dab8777f05a75'
exports.perms_entity_4_write_user_test = '/perms/entity/wu/661c83628e3ffab717b04b374acc8e59'

exports.perms_entity_5_write_group_2 = '/perms/entity/wg/76ee94a8533eb1da030212d97d446caf'
exports.perms_entity_5_write_user_2 = '/perms/entity/wu/b9177e34b519fa9a6997a08cedc11351'
