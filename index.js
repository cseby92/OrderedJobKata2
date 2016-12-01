'use strict'

const JOB_SEPARATOR = '=>';
const MULTIPLE_JOBS_SEPARATOR = '\n';
const NAME_INDEX = 0;
const DEPEPENDENCY_INDEX = 5;


class OrderJobsCommand {

    constructor(expression) {
        this._expression = expression || '';
    }

    execute() {
        return JobRepository.fromExpression(this._expression)
            .sortByDependency()
            .getNames()
            .join('');
    }

    static create(expression) {
        return new OrderJobsCommand(expression);
    }
}

class JobRepository {

    constructor(jobs = []) {
        this._jobs = jobs;
    }

    getNames() {
        return this._jobs.map((job) => job.name);
    }

    sortByDependency() {

        let ordered = new JobRepository();

        this._jobs.forEach((job) => {

            ordered._addJob(job);
            if (job.hasDependency()) {
                this._checkForSelfReference(job);
                this._checkForCircularDependencyChain(job);
                ordered._insertBefore(this._getJobByName(job.dependency), job);

            }
        });

        return ordered;
    }

    static fromExpression(expression) {
        let jobs = expression.split(MULTIPLE_JOBS_SEPARATOR).map(Job.fromExpression);
        return new JobRepository(jobs);
    }

    _checkForCircularDependencyChain(inJob){
        
        let cJobIndex = this._jobs.indexOf(inJob);
        let cJob = new Job({name: inJob.name, dependency: inJob.dependency});

        /*this._jobs.forEach((job, index) => {
            if(cJobIndex !== index && job.hasDependency()){
                if(cJob.dependency === job.name){
                    cJob.dependency = job.dependency;


                } 
            }
                                if(cJob.name === "b")
                    console.log(cJob);
                    
                if(cJob.hasSelfReference())
                    throw new Error("Jobs can't have circular dependencies");
        });*/
        this._jobs.forEach((job, index) => {
            if(cJobIndex !== index && job.hasDependency()){
                if(cJob.dependency === job.name){
                    cJob.dependency = job.dependency;

                if(cJob.hasSelfReference())
                    throw new Error("Jobs can't have circular dependencies");
                }
            }
        });

                

    }

    _checkForSelfReference(job) {
        if (job.hasSelfReference()){
            throw new Error("Jobs can’t depend on themselves");
        }
            
    }

    _addJob(job) {
        if (!this._jobExists(job))
            this._jobs.push(job);
    }

    _insertBefore(job, before) {
        if (!this._jobExists(job)) {
            let index = this._jobs.indexOf(before);
            this._jobs.splice(index, 0, job);
        }
    }

    _jobExists(job) {
        return Boolean((this._getJobByName(job.name)));
    }

    _getJobByName(jobName) {
        return this._jobs.find((job) => {
            if (job.name === jobName) return job;
        });
    }
}

class Job {

    constructor({ name, dependency }) {
        this.name = name;
        this.dependency = dependency;
    }

    static fromExpression(expression) {
        return new Job({
            name: Job._fetchNameFromExpression(expression),
            dependency: Job._fetchDependencyFromExpression(expression)
        });
    }

    hasSelfReference() {
        if(this.name != '' && this.name === this.dependency)
            return true;
        return false;
    }

    hasDependency() {
        return Boolean(this.dependency);
    }

    static _fetchNameFromExpression(expression) {

        return expression.charAt(NAME_INDEX);
    }
    static _fetchDependencyFromExpression(expression) {

        return expression.charAt(DEPEPENDENCY_INDEX) || '';
    }
}

module.exports = OrderJobsCommand;