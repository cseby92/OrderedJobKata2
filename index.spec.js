'use strict'

const expect = require('chai').expect;
const OrderJobsCommand = require('./index');

describe('OrderJobsCommand', function () {

    let order = (jobs) => OrderJobsCommand.create(jobs).execute();


    describe('#execute', () => {
        it('should return empty string for empty input', () => {
            expect(order('')).to.eql('');
        });

        it('should return the job if only is in the input', () => {
            expect(order('a =>')).to.eql('a');
            expect(order('b =>')).to.eql('b');
        });

        it('should return the jobs in any order if multiple jobs are given without dependency', () => {
            let jobs = order('a =>\nb =>\nc =>');

            expect(jobs.length).to.eql(3);
            expect(jobs).to.contain('a');
            expect(jobs).to.contain('b');
            expect(jobs).to.contain('c');
        });

        it('should return the jobs in order if multiple jobs are given with dependency', () => {
            let jobs = order('a =>\nb => c\nc =>');

            expect(jobs.indexOf('c')).to.below(jobs.indexOf('b'));

        });

        it('should return the jobs in order if multiple jobs are given with multiple dependency', () => {
            let jobs = order('a =>\nb => c\nc => f\nd => a\ne => b\nf =>');

            expect(jobs.indexOf('c')).to.below(jobs.indexOf('b'));
            expect(jobs.indexOf('f')).to.below(jobs.indexOf('c'));
            expect(jobs.indexOf('a')).to.below(jobs.indexOf('d'));
            expect(jobs.indexOf('b')).to.below(jobs.indexOf('e'));

        });

        it('should return an Error: "Jobs can’t depend on themselves" for a self reference', function () {

            expect(function () {
                let jobs = order('a =>\nb =>\nc => c');
            }).to.throw(Error, "Jobs can’t depend on themselves");
        });

        it('should return an Error: "Jobs can’t depend on themselves" for a self reference', function () {

            expect(function () {
                let jobs = order('a =>\nb => c\nc => f\nd => a\ne =>\nf => b');
            }).to.throw(Error, 'Jobs can\'t have circular dependencies');
        });
    });
});