import * as path from 'path'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as github from './github'
import {GeneratorConfiguration, ReportSnapshot, ProjectsData, ProjectData} from './interfaces'

export async function generate(token: string, configYaml: string): Promise<ReportSnapshot> {
    console.log("Generating reports");

    let configPath = path.join(__dirname, configYaml);
    let config = <GeneratorConfiguration>yaml.load(fs.readFileSync(configPath, 'utf-8'))

    let snapshot = <ReportSnapshot>{};
    snapshot.datetime = new Date();
    snapshot.config = config;

    let projectsData: ProjectsData = await loadProjectsData(token, config);

    console.log(JSON.stringify(projectsData, null, 2));

    return snapshot;
}

async function loadProjectsData(token: string, config: GeneratorConfiguration): Promise<ProjectsData> {
    let projMap = <ProjectsData>{};
    for (const projHtmlUrl of config.projects) {
        let proj = await github.getProject(token, projHtmlUrl);
        if (!proj) {
            throw new Error(`Project not found: ${projHtmlUrl}`);
        }

        projMap[projHtmlUrl] = proj;
    }
     
    console.log(JSON.stringify(projMap, null, 2));

    for (const projectUrl of config.projects) {
        let project: ProjectData = projMap[projectUrl];
        
        project.columns = {}
        let cols = await github.getColumnsForProject(token, project);
        cols.forEach((col) => {
            projMap[projectUrl].columns[col.name] = col.id;
        })
        
        project.stages = {}
        for (const key in config.columnMap) {
            project.stages[key] = [];

            let colNames = config.columnMap[key];
            for (const colName of colNames) {
                let colId = projMap[projectUrl].columns[colName];

                let cards = await github.getCardsForColumns(token, colId, colName);

                for (const card of cards) {
                    // cached since real column could be mapped to two different mapped columns
                    // read and build the event list once
                    let issueCard = await github.getIssueCard(token, card, project.id);
                    if (issueCard) {
                        project.stages[key].push(issueCard);
                    }
                }
            }
        }
    }

    return projMap;
}
