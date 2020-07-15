export interface ReportConfiguration {
    name: string,
    configuration: any
}

export interface GeneratorConfiguration {
    name: string,
    columnMap: any,
    projects: string[],
    filter: string,
    output: string,
    reports: ReportConfiguration[]    
}

export interface ReportSnapshotData {
    name: string,
    contents: string
}

export interface ReportSnapshot {
    datetime: Date,
    config: GeneratorConfiguration
}

export interface ProjectData {
    id: number,
    html_url: string,
    name: string,
    columns: { [key: string]: number }
    stages: { [key: string]: IssueCard[] }
}

export interface ProjectsData {
    projects: { [key: string]: ProjectData }
}

export interface IssueCardEvent {
    created: Date,
    event: string,
    data: any
}

export interface IssueCard {
    title: string,
    number: number;
    html_url: string,
    labels: string[],
    events: IssueCardEvent[]
}

export interface ProjectReport {
    getDefaultConfiguration(): any;
    process(data: ProjectData): ProjectData;
    render(data: ProjectData): string;
}
