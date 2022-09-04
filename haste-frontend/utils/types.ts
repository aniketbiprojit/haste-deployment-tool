export enum AllowedExecution {
	AddEmail = 'Add Emails',
	CheckDeploymentStatus = 'Check Deployment Status',
	ReadEnvironment = 'Read Environment',
	Deploy = 'Deploy',
	AddServer = 'Add Server',
	ViewUsers = 'View Users',
}

export type DataState = {
	root_access: boolean
	allowed_executions: AllowedExecution[]
}
